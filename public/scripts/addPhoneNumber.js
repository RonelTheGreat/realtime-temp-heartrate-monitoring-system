$("#alert").hide();

$("#sendCodeBtn").click((e) => {
  e.preventDefault();
  $("#sendCodeBtn").attr("disabled", true);
  $("#sendCodeBtn").text("Sending Code ...");
  $("#alert").hide();

  const phoneNumber = $("#phoneNumber").val();

  const data = {
    phoneNumber
  };

  $.ajax({
    url: "/contacts/request-verification-code",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(data),
    complete: function (data) {
      const { success, message } = data.responseJSON;

      if (!success) {
        $("#sendCodeBtn").attr("disabled", false);
        $("#sendCodeBtn").text("Send Verification Code");
        $("#alert").text(message).show();
        scrollTo("alert");
      } else {
        $("#verificationCode").removeAttr("disabled");
        $("#sendCodeBtn").css("display", "none");
        $("#submitBtn").removeAttr("hidden");
        $("#verificationCode").focus();
        $("#verificationCode").attr("placeholder", "Enter verification code");
      }
    }
  });
});

$("#submitBtn").click((e) => {
  e.preventDefault();
  $("#submitBtn").attr("disabled", true);
  $("#submitBtn").text("Please wait ...");
  $("#alert").hide();

  const phoneNumber = $("#phoneNumber").val();
  const verificationCode = $("#verificationCode").val();

  const data = {
    phoneNumber,
    verificationCode,
    name: window.localStorage.getItem("name"),
    username: window.localStorage.getItem("username"),
    password: window.localStorage.getItem("password"),
    cpassword: window.localStorage.getItem("cpassword")
  };

  $.ajax({
    url: "/contacts/verify",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(data),
    complete: function (data) {
      const { success, message } = data.responseJSON;

      if (!success) {
        $("#submitBtn").attr("disabled", false);
        $("#submitBtn").text("Finish");
        $("#alert").text(message).show();
        scrollTo("alert");
      } else {
        window.location.replace("/");
      }
    }
  });
});

// Scroll to element
function scrollTo(id) {
  $("html,body").animate({ scrollTop: $("#" + id).offset().top }, "fast");
}
