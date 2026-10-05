const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true
    },

    password: {
      type: String
    },

    specialization: {
      type: String,
      required: true
    },

    availableSlots: {
      type: [String],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);