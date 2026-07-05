const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "VVITU",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      // not required at doc creation time (admin uploads roll no before student sets password)
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    avatarColor: {
      type: String,
      default: "#7C3AED",
    },
  },
  { timestamps: true }
);

// A roll number is unique within a college, not globally
studentSchema.index({ rollNo: 1, college: 1 }, { unique: true });

module.exports = mongoose.model("Student", studentSchema);
