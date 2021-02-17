const HeartRate = require("../models/heartRate");
const checkBattery = require("./check-battery");
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

      // if device is ready
      socket.on("isDeviceReady", () => {
        isDeviceReady = true;
      });

      // if device is halted
      socket.on("haltDevice", () => {
        isDeviceReady = false;
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

        const emergencyState = dataFromDevice[0];
        const heartRate = dataFromDevice[1];
        const temperature = dataFromDevice[2];
        const batteryLevel = dataFromDevice[3];

        if (emergencyState.length > 1) {
          return;
        }
        if (isNaN(Number(heartRate))) {
          return;
        }
        if (isNaN(Number(temperature))) {
          return;
        }
        if (isNaN(Number(batteryLevel))) {
          return;
        }

        // if emergency
        if (emergencyState == "e") {
          if (!hasEmergency) {
            hasEmergency = true;
          }
          setTimeout(() => {
            if (isDeviceReady) {
              console.log("EMERGENCY! EMERGENCY! EMERGENCY!");
              // notifyContacts("EMERGENCY! EMERGENCY! EMERGENCY!");
            }
          }, 5000);
          io.emit("emergencyAlert", true);
          return;
        }

        // stop emergency
        if (emergencyState == "s" && hasEmergency) {
          hasEmergency = false;
          io.emit("emergencyAlert", false);
          return;
        }

        if (heartRateThreshold === null) {
          return;
        }
        const abnormalHeartRate = checkHeartRate(heartRateThreshold, heartRate);
        const hasFever = checkTemperature(temperature);
        const isLowBatt = checkBattery(batteryLevel);

        // abnormal heart rate
        if (abnormalHeartRate && isDeviceReady) {
          notifyContacts(`Detected abnormal heart rate ${heartRate} BPM`);
          console.log(`Detected abnormal heart rate ${heartRate} BPM`);
        }

        // has fever
        if (hasFever && !hasBeenNotifiedWithFever && isDeviceReady) {
          hasBeenNotifiedWithFever = true;
          notifyContacts(
            `The patient has fever with temperature of ${temperature} °C`
          );
          console.log(
            `The patient has fever with temperature of ${temperature} °C`
          );
        }
        // no fever
        if (!hasFever) {
          hasBeenNotifiedWithFever = false;
        }

        // low batt
        if (isLowBatt && !hasBeenNotifiedLowBatt && isDeviceReady) {
          hasBeenNotifiedLowBatt = true;
          notifyContacts(`Device battery is running low: ${batteryLevel}%`);
          console.log(`Device battery is running low: ${batteryLevel}%`);
        }
        // not low batt
        if (!isLowBatt) {
          hasBeenNotifiedLowBatt = false;
        }

        const dataForVIew = {
          heartRate,
          temperature,
          batteryLevel
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
            io.emit("isDeviceReady", isDeviceReady);
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
