const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeed,
  getPostById,
  toggleLike,
  deletePost,
} = require("../controllers/postController");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");
const { protectStudent, requirePasswordChanged } = require("../middleware/auth");

router.use(protectStudent);
router.use(requirePasswordChanged);

router.post("/", createPost);
router.get("/", getFeed);
router.get("/:id", getPostById);
router.delete("/:id", deletePost);
router.post("/:id/like", toggleLike);

router.post("/:postId/comments", addComment);
router.get("/:postId/comments", getComments);
router.delete("/comments/:commentId", deleteComment);

module.exports = router;
