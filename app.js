// require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");
const app = express();
const http = require("http").Server(app);
const io = socket(http);
const PORT = process.env.PORT || 3000;
const path = require("path");

// helpers
require("./helpers/global-variables");
const socketEvents = require("./helpers/socket-events");

// mongodb connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", async () => console.log("-- connected to DB"));

// express middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// routes
app.use("/contacts", require("./routes/contacts"));
app.use("/", require("./routes/home"));
app.use("/sign-in", require("./routes/signIn"));
app.use("/simulator", require("./routes/simulator"));
app.use("/handle-call", require("./routes/callHandler"));

// socket events listener
socketEvents.listen(io);

http.listen(PORT, () => console.log("Listening to port " + PORT));
