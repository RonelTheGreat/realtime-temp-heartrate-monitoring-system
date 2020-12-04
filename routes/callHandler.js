const express = require("express");
const router = express.Router();

router.post("/handle-call", async (req, res) => {
  console.log(req.body);

  // try {
  //   const newContact = await contact.save();
  //   res.json({ success: true, contact: newContact });
  // } catch (error) {
  //   res.status(400).json({ message: error.message });
  // }
});

module.exports = router;
