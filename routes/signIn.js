const express = require("express");
const router = express.Router();

const Contact = require("../models/contact");

router.get("/", (req, res) => {
  res.render("signIn", { pageTitle: "Sign In" });
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (username === "") {
    return res.json({
      success: false,
      message: "Cannot login without username!"
    });
  }

  if (password === "") {
    return res.json({
      success: false,
      message: "Cannot login without password"
    });
  }

  try {
    const contact = await Contact.findOne(
      { username: username },
      "_id name password"
    );

    if (!contact) {
      return res.json({
        success: false,
        message: "Username or password incorrect"
      });
    }

    if (contact.password !== password) {
      return res.json({
        success: false,
        message: "Username or password incorrect"
      });
    }

    res.cookie(
      "sessionID",
      { name: contact.name, id: contact._id },
      { maxAge: 31556952000 }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
