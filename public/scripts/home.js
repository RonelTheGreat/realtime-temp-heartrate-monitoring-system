$(window).on("unload", () => {
  socket.emit("disconnected", name);
});
const name = $("#name").val();

const socket = io("/privateRoom");

socket.emit("isActive", name);

socket.on("emergencyAlert", (emergency) => {
  if (emergency) {
    $("#emergencyNotif").modal();
    $("#emergencyTitle").removeClass("text-success").addClass("text-danger ");
    $("#emergencyIcon").removeClass("fa-check-circle").addClass("fa-bell");
    $("#emergencyText").text("emergency");
    $("#emergencyBodyText").text("our tower is under attack");
    $("#closeBtn").css("display", "none");
  } else {
    $("#emergencyNotif").modal();
    $("#emergencyTitle").removeClass("text-danger").addClass("text-success");
    $("#emergencyIcon").removeClass("fa-bell").addClass("fa-check-circle");
    $("#emergencyText").text("Oke kaayo na!");
    $("#emergencyBodyText").text("myda na nagresponde nga guardian! chillax");
    $("#closeBtn").css({ display: "flex", justifyContent: "flex-end" });
  }
});

socket.on("isDeviceConnected", (isConnected) => {
  if (isConnected) {
    $("#statusText").text("device is connected");
    $("#alertStatus").removeClass("alert-danger").addClass("alert-success");
    $("#indicatorIcon")
      .removeClass("fa-exclamation-triangle")
      .addClass("fa-wifi");
  } else {
    $("#statusText").text("device is disconnected");
    $("#alertStatus").removeClass("alert-success").addClass("alert-danger");
    $("#indicatorIcon")
      .removeClass("fa-wifi")
      .addClass("fa-exclamation-triangle");
  }
});

socket.on("data", (data) => {
  $("#bpm").text(data.heartRate);
  $("#temperature").text(data.temperature);
  $("#battery").text(data.battery);
});

socket.on("connectedContacts", (contacts) => {
  const contactListEl = [];

  contacts.forEach((contact) => {
    if (contact !== name) {
      contactListEl.push(`<li class="list-group-item">${contact}</li>`);
    }
  });

  $("#contactList").empty();
  $("#contactList").append(contactListEl);
});

$("#setBpmBtn").click(() => {
  const heartRate = $("#hearRateInput").val();

  if (heartRate) {
    socket.emit("setHeartRate", Number(heartRate));
  }
});
