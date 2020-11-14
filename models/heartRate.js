const mongoose = require("mongoose");

const hearRateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  min: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("HeartRate", hearRateSchema);
