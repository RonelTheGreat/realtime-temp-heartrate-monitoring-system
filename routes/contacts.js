require("dotenv").config();

const express = require("express");
const router = express.Router();
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const Contact = require("../models/contact");
const verifyCookie = require("../middlewares/verify-cookie");

router.get("/", verifyCookie, async (req, res) => {
  try {
    const verifiedContacts = await twilio.outgoingCallerIds.list();
    const contacts = await Contact.find({}, "_id name number");

    if (verifiedContacts && contacts) {
      const newContacts = contacts.map((contact) => {
        const found = verifiedContacts.findIndex(
          (vContact) => vContact.phoneNumber === `+63${contact.number}`
        );
        const payload = {
          _id: contact._id,
          name: contact.name,
          number: contact.number
        };
        if (found >= 0) {
          payload.verified = true;
        } else {
          payload.verified = false;
        }

        return payload;
      });

      res.render("contacts", { contacts: newContacts, pageTitle: "Contacts" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/add", verifyCookie, (req, res) => {
  res.render("addContact", { pageTitle: "Add Contact" });
});

router.post("/add", verifyCookie, async (req, res) => {
  const { name, username, password, cpassword } = req.body;

  if (!name) {
    return res.json({ success: false, message: "Please provide your name!" });
  }

  if (!username) {
    return res.json({ success: false, message: "A username is required!" });
  }

  if (password !== cpassword) {
    return res.json({ success: false, message: "Passwords dont match!" });
  }

  try {
    // const newContact = await contact.save();
    res.json({ success: true, contact: req.body });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/add-phone-number", verifyCookie, (req, res) => {
  res.render("addPhone", { pageTitle: "Add Phone Number" });
});

router.post("/verify", verifyCookie, async (req, res) => {
  const {
    name,
    username,
    phoneNumber,
    verificationCode,
    password,
    cpassword
  } = req.body;

  const verification = await twilio.verify
    .services(process.env.TWILIO_PHONE_VERIFICATION_SID)
    .verificationChecks.create({
      to: `+63${phoneNumber}`,
      code: verificationCode
    });

  if (verification.status !== "approved") {
    return res.json({
      success: false,
      message: "Verification code is invalid!"
    });
  }

  console.log(verification);
  return res.json({ success: true, message: "oke!" });
});

router.post("/request-verification-code", verifyCookie, async (req, res) => {
  const { phoneNumber } = req.body;

  if (
    !phoneNumber ||
    phoneNumber.toString().length < 10 ||
    phoneNumber.toString().length > 10
  ) {
    return res.json({
      success: false,
      message: "Phone number not valid!"
    });
  }

  try {
    const verification = await twilio.verify
      .services(process.env.TWILIO_PHONE_VERIFICATION_SID)
      .verifications.create({ to: `+63${phoneNumber}`, channel: "sms" });

    if (verification.status !== "pending") {
      return res.json({
        success: false,
        message: "Something went wrong, try again ..."
      });
    }

    console.log(verification);

    res.json({ success: true });
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

router.post("/delete", verifyCookie, async (req, res) => {
  const id = req.body.id;

  try {
    await Contact.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
