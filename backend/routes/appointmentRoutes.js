const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const authMiddleware = require("../middleware/authMiddleware");
const doctorAuthMiddleware = require("../middleware/doctorAuthMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { doctor, date, time } = req.body;

    if (!doctor || !date || !time) {
      return res.status(400).json({
        message: "Doctor, date and time are required"
      });
    }

    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    if (!doctorExists.availableSlots.includes(time)) {
      return res.status(400).json({
        message: "This time slot is not available for this doctor"
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      time
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "This doctor is already booked for this time slot"
      });
    }

    const appointment = await Appointment.create({
      patient: req.patient.id,
      doctor,
      date,
      time
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.patient.id
    })
      .populate("doctor", "name specialization")
      .sort({ date: 1, time: 1 });

    res.json({
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

router.get(
  "/doctor/my",
  doctorAuthMiddleware,
  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        doctor: req.doctor.id
      })
        .populate("patient", "name email")
        .populate("doctor", "name specialization email")
        .sort({ date: 1, time: 1 });

      res.json({
        count: appointments.length,
        appointments
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

router.get(
  "/doctor/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        doctor: req.params.id
      })
        .populate("patient", "name email")
        .populate("doctor", "name specialization")
        .sort({ date: 1, time: 1 });

      res.json({
        count: appointments.length,
        appointments
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

module.exports = router;