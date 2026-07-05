const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    college: {
      type: String,
      required: true,
      uppercase: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ college: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
