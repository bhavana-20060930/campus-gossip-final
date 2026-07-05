const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

// Verifies a student JWT and attaches decoded payload to req.student
const protectStudent = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "student") {
      return res.status(403).json({ message: "Not authorized as student" });
    }
    req.student = decoded; // { id, rollNo, college, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Verifies an admin JWT
const protectAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Blocks access to a route until the student has replaced their default
// (admin-assigned) password with one of their own. Must run after protectStudent.
const requirePasswordChanged = async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id).select("mustChangePassword");
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.mustChangePassword) {
      return res.status(403).json({
        code: "PASSWORD_CHANGE_REQUIRED",
        message: "You must set your own password before continuing",
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { protectStudent, protectAdmin, requirePasswordChanged };
