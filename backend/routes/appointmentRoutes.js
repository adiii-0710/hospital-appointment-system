const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const authMiddleware = require("../middleware/authMiddleware");
const doctorAuthMiddleware = require("../middleware/doctorAuthMiddleware");

const router = express.Router();

// Book an appointment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { doctor, date, time } = req.body;

    if (!doctor || !date || !time) {
      return res.status(400).json({
        message: "Doctor, date and time are required"
      });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    // Check for slot conflict
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      time
    });

    if (!doctorExists.availableSlots.includes(time)) {
  return res.status(400).json({
    message: "This time slot is not available for this doctor"
  });
}

    if (existingAppointment) {
      return res.status(400).json({
        message: "This doctor is already booked for this time slot"
      });
    }

    

    // Create appointment
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
// Get logged-in patient's appointments
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

// Get doctor's appointments
router.get("/doctor/:id", authMiddleware, async (req, res) => {
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
});
// Get logged-in doctor's appointment schedule
router.get(
  "/doctor/my",
  doctorAuthMiddleware,
  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        doctor: req.doctor.id
      })
        .populate("patient", "name email")
        .populate(
          "doctor",
          "name specialization email"
        )
        .sort({
          date: 1,
          time: 1
        });

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

