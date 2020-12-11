const HeartRate = require("../models/heartRate");
const checkHeartRate = require("./check-heart-rate");
const checkTemperature = require("./check-temperature");
const notifyContacts = require("./notify-contacts");

const socketEvents = {
  listen: (io) => {
    // socket event listener
    io.on("connection", (socket) => {
      // if emergency
      socket.on("emergency", (emergency) => {
        hasEmergency = emergency;
        io.emit("emergencyAlert", emergency);
      });

      // if device connects
      socket.on("deviceConnect", async () => {
        console.log("device connected");
        const heartRate = await HeartRate.findOne(
          { name: "heartRate" },
          "min max"
        );
        heartRateThreshold = heartRate;
        socket.nickname = "device";
        deviceId = socket.id;
        isDeviceConnected = true;
        io.emit("isDeviceConnected", true);
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
        io.emit("newHeartRate", heartRateThreshold);
      });

      // data from device
      socket.on("dataFromDevice", async ({ data }) => {
        const dataFromDevice = data.split(":");
        
        // if emergency
        if (dataFromDevice[0] == "e") {
          hasEmergency = true;
          io.emit("emergencyAlert", true);
          return;
        }

        // if stop emergency
        if (dataFromDevice[0] == "se") {
          hasEmergency = false;
          io.emit("emergencyAlert", false);
          return;
        }

        const heartRate = dataFromDevice[0];
        const temperature = dataFromDevice[1];
        const battery = dataFromDevice[2];

        

        const dataForVIew = {
          heartRate,
          temperature,
          battery
        };

        io.emit("data", dataForVIew);
      });

      // if a contact is active
      socket.on("isActive", (contact) => {
        if (contact) {
          if (!connectedContacts.includes(contact)) {
            socket.nickname = contact;
            connectedContacts.push(contact);
            io.emit("emergencyAlert", hasEmergency);
            io.emit("connectedContacts", connectedContacts);
            io.emit("isDeviceConnected", isDeviceConnected);
          }
        }
      });

      // if a contact is disconnected
      socket.on("disconnected", (disconnectedContact) => {
        connectedContacts = connectedContacts.filter(
          (contact) => contact !== disconnectedContact
        );

        if (connectedContacts.length > 0) {
          io.emit("connectedContacts", connectedContacts);
        }
      });

      // if device is disconnected
      socket.on("disconnect", () => {
        console.log(socket.nickname);
        if (socket.nickname === "device") {
          isDeviceConnected = false;
          deviceId = null;
          io.emit("isDeviceConnected", false);
        }
      });
    });
  }
};

module.exports = socketEvents;
