const express = require("express");
const router = express.Router();

const verifyCookie = require("../middlewares/verify-cookie");

router.get("/", verifyCookie, (req, res) => {
  res.render("accessPoints", { pageTitle: "Access Points" });
});

module.exports = router;
