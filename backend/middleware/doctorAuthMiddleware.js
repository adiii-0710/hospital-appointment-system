const jwt = require("jsonwebtoken");

const doctorAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Doctor authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "doctor") {
      return res.status(403).json({
        message: "Doctor access required"
      });
    }

    req.doctor = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired doctor token"
    });
  }
};

module.exports = doctorAuthMiddleware;