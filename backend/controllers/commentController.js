const Comment = require("../models/Comment");
const Post = require("../models/Post");

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findOne({ _id: req.params.postId, college: req.student.college });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: post._id,
      author: req.student.id,
      text: text.trim(),
    });

    post.commentCount += 1;
    await post.save();

    const populated = await comment.populate("author", "name rollNo avatarColor");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate("author", "name rollNo avatarColor");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.student.id) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { addComment, getComments, deleteComment };
