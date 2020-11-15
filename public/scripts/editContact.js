$("#alert").hide();

const id = $("#id").val();

$("#editingForm").submit((e) => {
  e.preventDefault();
  $("#submitBtn").attr("disabled", true);
  $("#submitBtn").text("updating ...");
  $("#cancelBtn").attr("disabled", true);
  $("#alert").hide();

  const data = {
    number: $("#number").val(),
    id: id
  };

  $.ajax({
    url: "/contacts/edit",
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
        window.location.replace("/contacts");
      }
    }
  });
});

$("#delContactBtn").click((e) => {
  e.preventDefault();
  $("#delContactBtn").text("deleting ...");
  $("#cancelBtn").attr("disabled", true);
  $("#submitBtn").attr("disabled", true);
  $("#delContactBtn").attr("disabled", true);
  $("#alert").hide();

  const data = {
    id: id
  };

  $.ajax({
    url: "/contacts/delete",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(data),
    complete: function (data) {
      const { success, message } = data.responseJSON;

      if (!success) {
        $("#delContactBtn").text("delete contact");
        $("#submitBtn").attr("disabled", false);
        $("#cancelBtn").attr("disabled", false);
        $("#delContactBtn").attr("disabled", false);
        $("#alert").text(message).show();
        scrollTo("alert");
      } else {
        window.location.replace("/contacts");
      }
    }
  });
});

// Scroll to element
function scrollTo(id) {
  $("html,body").animate({ scrollTop: $("#" + id).offset().top }, "fast");
}
