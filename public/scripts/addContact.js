$("#alert").hide();

$("#addingForm").submit((e) => {
  e.preventDefault();
  $("#submitBtn").attr("disabled", true);
  $("#submitBtn").text("validating info ...");
  $("#cancelBtn").attr("disabled", true);
  $("#alert").hide();

  const name = $("#name").val();
  const username = $("#username").val();
  const password = $("#password").val();
  const cpassword = $("#cpassword").val();

  const data = {
    name: name,
    username: username,
    password: password,
    cpassword: cpassword
  };

  $.ajax({
    url: "/contacts/add",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(data),
    complete: function (data) {
      const { success, message } = data.responseJSON;

      if (!success) {
        $("#submitBtn").attr("disabled", false);
        $("#submitBtn").text("submit");
        $("#cancelBtn").attr("disabled", false);
        $("#alert").text(message).show();
        scrollTo("alert");
      } else {
        const {
          name,
          username,
          password,
          cpassword
        } = data.responseJSON.contact;
        window.localStorage.setItem("name", name);
        window.localStorage.setItem("username", username);
        window.localStorage.setItem("password", password);
        window.localStorage.setItem("cpassword", cpassword);
        window.location.replace("/contacts/add-phone-number");
      }
    }
  });
});

// Scroll to element
function scrollTo(id) {
  $("html,body").animate({ scrollTop: $("#" + id).offset().top }, "fast");
}
