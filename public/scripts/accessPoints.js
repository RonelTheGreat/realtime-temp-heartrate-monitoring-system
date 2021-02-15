// on page load
$(".apList").hide();
socket.emit("getWifiCredentials");

// show or hide password
togglePassword("showPasswordBtn1", "passInput1");
togglePassword("showPasswordBtn2", "passInput2");

// on save changes
$(".saveBtn").click(() => {
  apn1 = $(".apnInput1");
  pass1 = $(".passInput1");
  apn2 = $(".apnInput2");
  pass2 = $(".passInput2");

  apn1.prop("disabled", true);
  pass1.prop("disabled", true);
  apn2.prop("disabled", true);
  pass2.prop("disabled", true);
  $("#showPasswordBtn1").prop("disabled", true);
  $("#showPasswordBtn2").prop("disabled", true);
  $(".saveBtn").text("Saving ...");
  $(".saveBtn").prop("disabled", true);

  const data = {
    name1: apn1.val(),
    pass1: pass1.val(),
    name2: apn2.val(),
    pass2: pass2.val()
  };

  socket.emit("updateWifiCreds", data);
});

socket.on("editWifiCreds", (data) => {
  $(".alert").hide();
  $(".apList").show();

  $(".passInput1").val(data[0].pass);
  $(".apnInput1").val(data[0].name);

  $(".passInput2").val(data[1].pass);
  $(".apnInput2").val(data[1].name);
});

socket.on("hasUpdatedWifiCreds", () => {
  $(".apnInput1").prop("disabled", false);
  $(".passInput1").prop("disabled", false);
  $(".apnInput2").prop("disabled", false);
  $(".passInput2").prop("disabled", false);
  $("#showPasswordBtn1").prop("disabled", false);
  $("#showPasswordBtn2").prop("disabled", false);
  $(".saveBtn").text("Save Changes");
  $(".saveBtn").prop("disabled", false);
});

// toggle show/hide password
function togglePassword(btnId, inputClass) {
  $(`#${btnId}`).click(() => {
    const inputState = $(`.${inputClass}`).attr("type");

    if (inputState == "password") {
      $(`.${inputClass}`).attr("type", "text");
    } else {
      $(`.${inputClass}`).attr("type", "password");
    }
  });
}
