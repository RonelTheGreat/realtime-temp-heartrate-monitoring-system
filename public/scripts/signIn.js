$("#alert").hide();

$("#signinForm").submit((e) => {
  e.preventDefault();
  $("#submitBtn").attr("disabled", true);
  $("#submitBtn").text("signing in ...");
  $("#alert").hide();

  const username = $("#username").val();
  const password = $("#password").val();

  const data = {
    username: username,
    password: password
  };

  $.ajax({
    url: "/sign-in",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(data),
    complete: function (data) {
      const { success, message } = data.responseJSON;

      if (!success) {
        $("#submitBtn").attr("disabled", false);
        $("#submitBtn").text("submit");
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
