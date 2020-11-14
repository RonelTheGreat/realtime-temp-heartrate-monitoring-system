require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socket(server);
const PORT = process.env.PORT || 3000;
const HeartRate = require("./models/heartRate");

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
    console.log(heartRateThreshold);
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
  socket.on("dataFromDevice", (data) => {
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
