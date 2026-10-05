const express = require("express");
const bcrypt = require("bcryptjs");
const Doctor = require("../models/Doctor");

const router = express.Router();

// Get all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");

    res.json(doctors);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Create one or multiple doctors
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    // Multiple doctors
    if (Array.isArray(data)) {
      const doctors = [];

      for (const doctorData of data) {
        const {
          name,
          email,
          password,
          specialization,
          availableSlots
        } = doctorData;

        if (
          !name ||
          !email ||
          !password ||
          !specialization ||
          !availableSlots
        ) {
          return res.status(400).json({
            message:
              "Every doctor must have name, email, password, specialization and available slots"
          });
        }

        const existingDoctor =
          await Doctor.findOne({ email });

        if (existingDoctor) {
          return res.status(400).json({
            message:
              `Doctor with email ${email} already exists`
          });
        }

        const hashedPassword =
          await bcrypt.hash(password, 10);

        const doctor = await Doctor.create({
          name,
          email,
          password: hashedPassword,
          specialization,
          availableSlots
        });

        doctors.push({
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
          availableSlots: doctor.availableSlots
        });
      }

      return res.status(201).json({
        message: `${doctors.length} doctors created successfully`,
        doctors
      });
    }


    // Single doctor
    const {
      name,
      email,
      password,
      specialization,
      availableSlots
    } = data;

    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      !availableSlots
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, specialization and available slots are required"
      });
    }

    const existingDoctor =
      await Doctor.findOne({ email });

    if (existingDoctor) {
      return res.status(400).json({
        message:
          "Doctor with this email already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      availableSlots
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        availableSlots: doctor.availableSlots
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


module.exports = router;