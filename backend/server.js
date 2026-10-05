const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const doctorAuthRoutes = require("./routes/doctorAuthRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctor-auth", doctorAuthRoutes);
app.use("/api/appointments", appointmentRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log(
      "MongoDB connection failed:",
      error.message
    );
  });

app.get("/", (req, res) => {
  res.json({
    message:
      "Hospital Appointment Booking API is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Hospital Appointment API is healthy"
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});