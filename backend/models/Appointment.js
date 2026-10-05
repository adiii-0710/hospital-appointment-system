const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    date: {
      type: String,
      required: true
    },

    time: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);