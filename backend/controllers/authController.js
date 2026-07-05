const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

const generateToken = (student) => {
  return jwt.sign(
    {
      id: student._id,
      rollNo: student.rollNo,
      college: student.college,
      role: "student",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const studentPublicShape = (student) => ({
  id: student._id,
  rollNo: student.rollNo,
  college: student.college,
  name: student.name,
  department: student.department,
  year: student.year,
  bio: student.bio,
  avatarColor: student.avatarColor,
  mustChangePassword: student.mustChangePassword,
});

// Student logs in with the roll no + whatever password is currently set
// (either the shared default password from the admin, or their own after they've changed it).
const login = async (req, res) => {
  try {
    const { rollNo, college, password } = req.body;
    if (!rollNo || !college || !password) {
      return res.status(400).json({ message: "Roll number, college and password are required" });
    }

    const student = await Student.findOne({
      rollNo: rollNo.trim().toUpperCase(),
      college: college.trim().toUpperCase(),
    });

    if (!student || !student.isRegistered || !student.password) {
      return res.status(401).json({
        message: "Invalid roll number or password. If you're new, ask your admin to add your roll number.",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid roll number or password" });
    }

    const token = generateToken(student);
    res.status(200).json({
      token,
      student: studentPublicShape(student),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Called right after a first-time login (or any time a student wants to change
// their password). Requires a valid student token, so the default-password
// login has to succeed first - this just replaces that password with their own.
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(newPassword, salt);
    student.mustChangePassword = false;
    await student.save();

    res.status(200).json({
      message: "Password updated",
      student: studentPublicShape(student),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { login, changePassword, getMe };
