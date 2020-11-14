const express = require("express");
const router = express.Router();

const verifyCookie = require("../middlewares/verify-cookie");

router.get("/", verifyCookie, (req, res) => {
  const { sessionID } = req.cookies;
  res.render("home", { ...sessionID, pageTitle: "Realtime Temp & HB" });
});

module.exports = router;
