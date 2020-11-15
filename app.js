require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();
const server = http.createServer(app);
const io = socket(server);
const PORT = process.env.PORT || 3000;
const HeartRate = require("./models/heartRate");
const Contact = require("./models/contact");

// mongodb connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", async () => console.log("-- connected to DB"));

// express middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// routes
app.use("/contacts", require("./routes/contacts"));
app.use("/", require("./routes/home"));
app.use("/sign-in", require("./routes/signIn"));
app.use("/simulator", require("./routes/simulator"));

// socket
let connectedContacts = [];
let isDeviceConnected = false;
let hasEmergency = false;
let heartRateThreshold = null;
let isNotifyingContacts = false;
let heartRateSamples = 0;
const privateRoom = io.of("/privateRoom");

privateRoom.on("connection", (socket) => {
  // if emergency
  socket.on("emergency", (emergency) => {
    hasEmergency = emergency;
    privateRoom.emit("emergencyAlert", emergency);
  });

  // if device connects
  socket.on("deviceConnect", async () => {
    const heartRate = await HeartRate.findOne({ name: "heartRate" }, "min max");
    heartRateThreshold = heartRate;
    socket.nickname = "device";
    deviceId = socket.id;
    isDeviceConnected = true;
    privateRoom.emit("isDeviceConnected", true);
  });

  // if heart rate is set
  socket.on("setHeartRate", async (heartRate) => {
    const id = heartRateThreshold._id;

    // save new heart rate to DB
    const newHeartRate = await HeartRate.findByIdAndUpdate(
      id,
      {
        $set: { min: heartRate.min, max: heartRate.max }
      },
      { new: true }
    );
    heartRateThreshold.min = newHeartRate.min;
    heartRateThreshold.max = newHeartRate.max;
    privateRoom.emit("newHeartRate", heartRateThreshold);
  });

  // data from device
  socket.on("dataFromDevice", async (data) => {
    const { min, max } = heartRateThreshold;
    const { heartRate } = data;

    // if bad or abnormal heart rate
    if ((heartRate < min || heartRate > max) && data) {
      heartRateSamples++;
      console.log(heartRateSamples);
    }

    // if good or normal heart rate but previously detected bad heart rate
    // reset samples
    if (heartRate >= min && heartRate <= max && heartRateSamples > 0) {
      heartRateSamples = 0;
    }

    // if received consecutive bad heart rate
    // notify contacts
    if (heartRateSamples >= 3 && !isNotifyingContacts) {
      isNotifyingContacts = true;
      // twilio.messages
      //   .create({
      //     to: "+639771064377",
      //     from: process.env.TWILIO_NUMBER,
      //     body: "Test message"
      //   })
      //   .then((message) => {
      //     console.log(message.sid);
      //   })
      //   .catch((err) => console.error(err));
      // twilio.calls.create(
      //   {
      //     url: "http://demo.twilio.com/docs/voice.xml",
      //     to: "+639514642872",
      //     from: process.env.TWILIO_NUMBER
      //   },
      //   (err, call) => {
      //     if (err) return console.log(err);
      //     console.log(call.sid);
      //   }
      // );
      console.log("notify contacts");
    }
    privateRoom.emit("data", data);
  });

  // if a contact is active
  socket.on("isActive", (contact) => {
    if (contact) {
      if (!connectedContacts.includes(contact)) {
        socket.nickname = contact;
        connectedContacts.push(contact);
        privateRoom.emit("emergencyAlert", hasEmergency);
        privateRoom.emit("connectedContacts", connectedContacts);
        privateRoom.emit("isDeviceConnected", isDeviceConnected);
      }
    }
  });

  // if a contact is disconnected
  socket.on("disconnected", (disconnectedContact) => {
    connectedContacts = connectedContacts.filter(
      (contact) => contact !== disconnectedContact
    );

    if (connectedContacts.length > 0) {
      privateRoom.emit("connectedContacts", connectedContacts);
    }
  });

  // if device is disconnected
  socket.on("disconnect", () => {
    if (socket.nickname === "device") {
      isDeviceConnected = false;
      deviceId = null;
      privateRoom.emit("isDeviceConnected", false);
    }
  });
});

server.listen(PORT, () => console.log("Listening to port " + PORT));
