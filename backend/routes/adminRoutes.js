const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  adminLogin,
  uploadRollList,
  addStudent,
  listStudents,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });

router.post("/login", adminLogin);
router.post("/upload-rolllist", protectAdmin, upload.single("file"), uploadRollList);
router.post("/students", protectAdmin, addStudent);
router.get("/students", protectAdmin, listStudents);

module.exports = router;
