require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socket(server);
const PORT = process.env.PORT || 3000;

// mongodb connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => console.log("-- connected to DB"));

// express middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// routes
app.use("/contacts", require("./routes/contacts"));
app.use("/", require("./routes/home"));
app.use("/sign-in", require("./routes/signIn"));

// socket
let connectedContacts = [];
const privateRoom = io.of("/privateRoom");

privateRoom.on("connection", (socket) => {
  socket.on("dataFromDevice", (data) => {
    privateRoom.emit("data", data);
  });

  socket.on("isActive", (contact) => {
    if (contact) {
      if (!connectedContacts.includes(contact)) {
        socket.nickname = contact;
        connectedContacts.push(contact);
        privateRoom.emit("connectedContacts", connectedContacts);
      }
    }
  });

  socket.on("disconnected", (disconnectedContact) => {
    connectedContacts = connectedContacts.filter(
      (contact) => contact !== disconnectedContact
    );

    if (connectedContacts.length > 0) {
      privateRoom.emit("connectedContacts", connectedContacts);
    }
  });
});

server.listen(PORT, () => console.log("Listening to port " + PORT));
