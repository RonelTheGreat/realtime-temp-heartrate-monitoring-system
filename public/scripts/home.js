const name = $("#name").val();
const minHeartRate = $("#hearRateInputMin");
const maxHeartRate = $("#hearRateInputMax");

socket.emit("isActive", name);

socket.on("newHeartRate", (newHeartRate) => {
  minHeartRate.val(newHeartRate.min);
  maxHeartRate.val(newHeartRate.max);
});

socket.on("emergencyAlert", (emergency) => {
  if (emergency) {
    $("#emergencyNotif").modal();
    $("#emergencyTitle").removeClass("text-success").addClass("text-danger ");
    $("#emergencyIcon").removeClass("fa-check-circle").addClass("fa-bell");
    $("#emergencyText").text("emergency");
    $("#emergencyBodyText").text("our tower is under attack");
    $("#closeBtn").css("display", "none");
  } else {
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
  compareTemperature(38, data.temperature);
  compareHeartRate(
    { min: minHeartRate.val(), max: maxHeartRate.val() },
    data.heartRate
  );

  compareBattery(25, data.battery);

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

$("#setHeartRateBtn").click(() => {
  $("#heartRate").collapse("hide");

  if (minHeartRate && maxHeartRate) {
    socket.emit("setHeartRate", {
      min: minHeartRate.val(),
      max: maxHeartRate.val()
    });
  }
});

$("#heartRateTogglerBtn").click(() => {
  $("#heartRate").collapse("toggle");
});

$(window).on("unload", () => {
  socket.emit("disconnected", name);
});

// functions for comparing data
function compareTemperature(refTemp, temp) {
  if (temp >= refTemp) {
    $("#tempParent").removeClass("text-dark").addClass("text-danger");
    $("#tempIcon").removeClass("text-success").addClass("text-danger");
    $("#tempIcon")
      .removeClass("fa-temperature-low")
      .addClass("fa-temperature-high");
  } else {
    $("#tempParent").removeClass("text-danger").addClass("text-dark");
    $("#tempIcon").removeClass("text-danger").addClass("text-success");
    $("#tempIcon")
      .removeClass("fa-temperature-high")
      .addClass("fa-temperature-low");
  }
}

function compareHeartRate(refHeartRate, heartRate) {
  if (heartRate > refHeartRate.max) {
    $("#heartRateParent")
      .removeClass(["text-dark", "text-muted"])
      .addClass("text-danger");
    $(".heart").css("animation", "heartbeat 618ms infinite");
  }

  if (heartRate >= refHeartRate.min && heartRate <= refHeartRate.max) {
    $("#heartRateParent").removeClass("text-danger").addClass("text-dark");
    $(".heart").css("animation", "heartbeat 1.618s infinite");
  }

  if (heartRate < refHeartRate.min) {
    $("#heartRateParent").removeClass("text-danger").addClass("text-muted");
    $(".heart").css("animation", "heartbeat 2.168s infinite");
  }
}

function compareBattery(refBattery, battery) {
  if (battery <= refBattery) {
    $("#batteryParent").removeClass("text-dark").addClass("text-danger");
    $("#batteryIcon").removeClass("text-success").addClass("text-danger");
    $("#batteryIcon")
      .removeClass("fa-battery-three-quarters")
      .addClass("fa-battery-quarter");
  } else {
    $("#batteryParent").removeClass("text-danger").addClass("text-dark");
    $("#batteryIcon").removeClass("text-danger").addClass("text-success");
    $("#batteryIcon")
      .removeClass("fa-battery-quarter")
      .addClass("fa-battery-three-quarters");
  }
}
