const socket = io("/privateRoom");

const emergencyBtn = $("#emergencyBtn");
const stopBtn = $("#stopBtn");

emergencyBtn.click(() => {
  socket.emit("emergency", true);
});

stopBtn.click(() => {
  socket.emit("emergency", false);
});

// simulate sending of data from device
setInterval(() => {
  socket.emit("dataFromDevice", {
    temperature: Math.floor(Math.random() * (40 - 36 + 1)) + 36,
    heartRate: Math.floor(Math.random() * (100 - 65 + 1)) + 65,
    battery: Math.floor(Math.random() * (100 - 1 + 1)) + 1
  });
}, 1000);

// simulate device connection
socket.emit("deviceConnect");

// simulate setting min/max heart rate
socket.on("newHeartRate", (heartRate) => {
  // if on the actual device
  // write to EEPROM
  const storage = window.localStorage;
  storage.setItem("min", heartRate.min);
  storage.setItem("max", heartRate.max);
});
