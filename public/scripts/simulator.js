const socket = io("/privateRoom");

$("#emergencyBtn").click(() => {
  socket.emit("emergency", true);
});

$("#stopBtn").click(() => {
  socket.emit("emergency", false);
});

$("#tempBtn").click(() => {
  socket.emit("dataFromDevice", {
    temperature: Math.floor(Math.random() * (40 - 36 + 1)) + 36,
    heartRate: 75,
    battery: 90
  });
});

$("#heartRateBtn").click(() => {
  socket.emit("dataFromDevice", {
    temperature: 37,
    heartRate: Math.floor(Math.random() * (150 - 50 + 1)) + 50,
    battery: 85
  });
});

$("#batteryBtn").click(() => {
  socket.emit("dataFromDevice", {
    temperature: 37,
    heartRate: 75,
    battery: Math.floor(Math.random() * (100 - 0 + 1))
  });
});

$("#badHeartRateBtn").click(() => {
  socket.emit("dataFromDevice", {
    temperature: 37,
    heartRate: Math.floor(Math.random() * (200 - 120 + 1)) + 120,
    battery: 87
  });
});

// simulate sending of data from device
// setInterval(() => {
//   socket.emit("dataFromDevice", {
//     temperature: Math.floor(Math.random() * (40 - 36 + 1)) + 36,
//     heartRate: Math.floor(Math.random() * (100 - 65 + 1)) + 65,
//     battery: Math.floor(Math.random() * (100 - 1 + 1)) + 1
//   });
// }, 1000);

// simulate device connection
socket.emit("deviceConnect");
