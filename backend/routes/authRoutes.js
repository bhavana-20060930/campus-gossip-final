const express = require("express");
const router = express.Router();
const { login, changePassword, getMe } = require("../controllers/authController");
const { protectStudent } = require("../middleware/auth");

router.post("/login", login);
router.post("/change-password", protectStudent, changePassword);
router.get("/me", protectStudent, getMe);

module.exports = router;
