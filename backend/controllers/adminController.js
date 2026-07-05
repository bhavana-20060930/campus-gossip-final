const jwt = require("jsonwebtoken");
const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

const DEFAULT_PASSWORD_FALLBACK = process.env.DEFAULT_STUDENT_PASSWORD || "vvit@123";

// Admin "login" - checks a shared secret defined in .env, issues an admin JWT.
// This keeps things simple for a college project: there's no separate admin
// user table, just one secret key known to the college authority running this.
const adminLogin = async (req, res) => {
  const { secret } = req.body;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: "Invalid admin secret" });
  }
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.status(200).json({ token });
};

// Upload a CSV with columns: rollNo,name,department,year,college
// Every new student is created with a shared default password (set by the admin,
// or falling back to DEFAULT_STUDENT_PASSWORD / "vvit@123") and mustChangePassword=true,
// so they're forced to pick their own password the first time they log in.
const uploadRollList = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No CSV file uploaded" });
  }

  const defaultPassword = (req.body.defaultPassword || DEFAULT_PASSWORD_FALLBACK).trim();
  const salt = await bcrypt.genSalt(10);
  const hashedDefaultPassword = await bcrypt.hash(defaultPassword, salt);

  const rows = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {
      let created = 0;
      let skipped = 0;
      const errors = [];

      for (const row of rows) {
        try {
          const rollNo = (row.rollNo || row.RollNo || row.roll_no || "").trim().toUpperCase();
          const college = (row.college || row.College || "VVITU").trim().toUpperCase();
          const name = (row.name || row.Name || "").trim();

          if (!rollNo || !name) {
            skipped++;
            continue;
          }

          const exists = await Student.findOne({ rollNo, college });
          if (exists) {
            skipped++;
            continue;
          }

          await Student.create({
            rollNo,
            college,
            name,
            department: (row.department || row.Department || "").trim(),
            year: (row.year || row.Year || "").trim(),
            password: hashedDefaultPassword,
            isRegistered: true,
            mustChangePassword: true,
          });
          created++;
        } catch (err) {
          errors.push(err.message);
        }
      }

      fs.unlink(filePath, () => {}); // cleanup temp file

      res.status(200).json({
        message: "CSV processed",
        created,
        skipped,
        errors,
        defaultPasswordUsed: defaultPassword,
      });
    })
    .on("error", (err) => {
      res.status(500).json({ message: "Failed to parse CSV", error: err.message });
    });
};

// Add a single student manually (alternative to CSV) - also gets the shared default password
const addStudent = async (req, res) => {
  try {
    const { rollNo, name, department, year, college, defaultPassword } = req.body;
    if (!rollNo || !name) {
      return res.status(400).json({ message: "rollNo and name are required" });
    }
    const normalizedRoll = rollNo.trim().toUpperCase();
    const normalizedCollege = (college || "VVITU").trim().toUpperCase();

    const exists = await Student.findOne({ rollNo: normalizedRoll, college: normalizedCollege });
    if (exists) {
      return res.status(400).json({ message: "Roll number already exists for this college" });
    }

    const passwordToUse = (defaultPassword || DEFAULT_PASSWORD_FALLBACK).trim();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordToUse, salt);

    const student = await Student.create({
      rollNo: normalizedRoll,
      name,
      department,
      year,
      college: normalizedCollege,
      password: hashedPassword,
      isRegistered: true,
      mustChangePassword: true,
    });

    const { password, ...studentWithoutPassword } = student.toObject();
    res.status(201).json({ ...studentWithoutPassword, defaultPasswordUsed: passwordToUse });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const listStudents = async (req, res) => {
  try {
    const { college } = req.query;
    const filter = college ? { college: college.toUpperCase() } : {};
    const students = await Student.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { adminLogin, uploadRollList, addStudent, listStudents };
