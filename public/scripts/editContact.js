$("#alert").hide();

$("#editingForm").submit((e) => {
  e.preventDefault();
  $("#submitBtn").attr("disabled", true);
  $("#submitBtn").text("updating ...");
  $("#cancelBtn").attr("disabled", true);
  $("#alert").hide();

  const number = $("#number").val();
  const id = $("#id").val();

  console.log(id, number);

  const data = {
    number: number,
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

// Scroll to element
function scrollTo(id) {
  $("html,body").animate({ scrollTop: $("#" + id).offset().top }, "fast");
}
