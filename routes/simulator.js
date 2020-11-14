const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("simulator", { pageTitle: "Simulator" });
});

module.exports = router;
