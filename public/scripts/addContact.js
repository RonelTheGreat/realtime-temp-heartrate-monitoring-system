$("#alert").hide();

$("#addingForm").submit((e) => {
  e.preventDefault();
  $("#submitBtn").attr("disabled", true);
  $("#submitBtn").text("adding ...");
  $("#cancelBtn").attr("disabled", true);
  $("#alert").hide();

  const name = $("#name").val();
  const username = $("#username").val();
  const number = $("#number").val();
  const password = $("#password").val();
  const cpassword = $("#cpassword").val();

  const data = {
    name: name,
    username: username,
    number: number,
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
        window.location.replace("/");
      }
    }
  });
});

// Scroll to element
function scrollTo(id) {
  $("html,body").animate({ scrollTop: $("#" + id).offset().top }, "fast");
}
