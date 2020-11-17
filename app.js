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
var heartRateSamples = 0;
var temperatureSamples = 0;
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
    const isHRAbnormal = checkHeartRate(heartRateThreshold, data.heartRate);
    const hasFever = checkTemperature(37.5, data.temperature);
    const isLowBatt = checkBattery(25, data.battery);

    if (isHRAbnormal && !isNotifyingContacts) {
      isNotifyingContacts = true;
      console.log("notifying contacts");

      const verifiedContacts = await twilio.outgoingCallerIds.list();
      let twimlNumbers = "";

      verifiedContacts.forEach((contact) => {
        twimlNumbers += `<Number>${contact.phoneNumber}</Number>`;
      });

      const twiml = `
          <Response>
            <Dial timeout="10" callerId="+639514642872">
              ${twimlNumbers}
            </Dial>
          </Response>`;

      twilio.calls.create(
        {
          twiml: twiml,
          from: process.env.TWILIO_NUMBER
        },
        (err, call) => {
          if (err) return console.log(err);
          console.log(call.status);
        }
      );

      // twilio.calls.create(
      //   {
      //     url: "http://demo.twilio.com/docs/voice.xml",
      //     to: "+639514642872",
      //     timeout: 10,
      //     from: process.env.TWILIO_NUMBER
      //   },
      //   (err, call) => {
      //     if (err) return console.log(err);
      //     console.log(call.status);
      //   }
      // );

      // setTimeout(() => {
      //   console.log("DONE notifying contacts");
      //   isNotifyingContacts = false;
      //   heartRateSamples = 0;
      // }, 3000);
      // notifyContacts("detected abnormal heart rate!");
    }

    if (hasFever) {
      notifyContacts("has fever");
    }

    if (isLowBatt) {
      notifyContacts("low battery");
    }

    privateRoom.emit("data", data);
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

function checkHeartRate({ min, max }, heartRate) {
  // if bad or abnormal heart rate
  if (heartRate < min || heartRate > max) {
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
  if (heartRateSamples >= 3) {
    return true;
  }
}

function checkTemperature(refTemperature, temperature) {
  if (temperature > refTemperature) {
    temperatureSamples++;
    console.log(temperatureSamples);
  }

  if (temperature < 37.5 && temperatureSamples > 0) {
    temperatureSamples = 0;
  }

  if (temperatureSamples >= 3) {
    return true;
  }
}

function checkBattery(refBattery, battery) {
  if (battery <= refBattery) {
    return true;
  }
}

async function notifyContacts(message) {
  const verifiedContacts = await twilio.outgoingCallerIds.list();

  Promise.all(
    verifiedContacts.map((contact) => {
      return twilio.messages.create({
        to: contact.phoneNumber,
        from: process.env.TWILIO_MESSAGE_SERVICE_SID,
        body: message
      });
    })
  )
    .then(() => {
      console.log("Messages sent!");
    })
    .catch((err) => console.error(err));
}

server.listen(PORT, () => console.log("Listening to port " + PORT));
