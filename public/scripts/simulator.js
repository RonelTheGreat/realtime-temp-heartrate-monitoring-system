$("#emergencyBtn").click(() => {
  socket.emit("dataFromDevice", { data: "e"});
});

$("#stopBtn").click(() => {
  socket.emit("dataFromDevice", { data: "se"});
});

$("#tempBtn").click(() => {
  socket.emit("dataFromDevice", {
    temperature: Math.floor(Math.random() * (40 - 36 + 1)) + 36,
    heartRate: 75,
    battery: 90
  });
});

$("#heartRateBtn").click(() => {
  socket.emit("dataFromDevice", { data: `${Math.floor(Math.random() * (150 - 50 + 1)) + 50}:36.14:97`});
});

$("#batteryBtn").click(() => {
  socket.emit("dataFromDevice", {
    temperature: 37,
    heartRate: 75,
    battery: Math.floor(Math.random() * (100 - 0 + 1))
  });
});


$("#badHeartRateBtn").click(() => {
  socket.emit("dataFromDevice", { data: `${Math.floor(Math.random() * (200 - 120 + 1)) + 120}:36.14:97`});
});

// simulate device connection
socket.emit("deviceConnect");
