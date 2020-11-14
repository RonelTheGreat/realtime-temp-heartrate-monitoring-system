const express = require("express");
const router = express.Router();

const Contact = require("../models/contact");
const verifyCookie = require("../middlewares/verify-cookie");

router.get("/", verifyCookie, async (req, res) => {
  try {
    const contacts = await Contact.find({}, "_id name number");

    res.render("contacts", { contacts, pageTitle: "Contacts" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/add", verifyCookie, (req, res) => {
  res.render("addContact", { pageTitle: "Add Contact" });
});

router.post("/add", verifyCookie, async (req, res) => {
  const { name, number, username, password, cpassword } = req.body;

  if (!name) {
    return res.json({ success: false, message: "Please provide your name!" });
  }

  if (!number) {
    return res.json({
      success: false,
      message: "Please provide your contact number!"
    });
  }

  if (!username) {
    return res.json({ success: false, message: "A username is required!" });
  }

  if (password !== cpassword) {
    return res.json({ success: false, message: "Passwords dont match!" });
  }

  const contact = await Contact({
    name,
    number,
    username,
    password,
    cpassword
  });

  try {
    const newContact = await contact.save();
    res.json({ success: true, contact: newContact });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:id/edit", verifyCookie, async (req, res) => {
  const id = req.params.id;

  try {
    const contact = await Contact.findById(id, "name number");
    res.render("editContact", { contact, pageTitle: "Edit Contact" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/edit", verifyCookie, async (req, res) => {
  const id = req.body.id;
  const number = req.body.number;

  try {
    const contact = await Contact.findByIdAndUpdate(id, { $set: { number } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
