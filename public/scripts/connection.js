$(window).on("unload", () => {
  socket.emit("disconnected", name);
});
const name = $("#name").val();

const socket = io("/privateRoom");

socket.emit("isActive", name);

socket.on("data", (data) => {
  console.log(data);
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
