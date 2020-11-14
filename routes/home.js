const express = require("express");
const router = express.Router();

const verifyCookie = require("../middlewares/verify-cookie");
const HeartRate = require("../models/heartRate");

router.get("/", verifyCookie, async (req, res) => {
  const { sessionID } = req.cookies;
  const heartRate = await HeartRate.findOne({ name: "heartRate" });
  res.render("home", {
    ...sessionID,
    pageTitle: "Realtime Temp & HB",
    heartRate
  });
});

module.exports = router;
