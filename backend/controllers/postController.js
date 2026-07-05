const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Create a post - scoped to the logged-in student's college
const createPost = async (req, res) => {
  try {
    const { text, imageUrl } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Post text is required" });
    }

    const post = await Post.create({
      author: req.student.id,
      college: req.student.college,
      text: text.trim(),
      imageUrl: imageUrl || null,
    });

    const populated = await post.populate("author", "name rollNo avatarColor department");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get paginated feed - only posts from the student's own college
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { college: req.student.college };
    if (req.query.mine === "true") {
      filter.author = req.student.id;
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name rollNo avatarColor department");

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, college: req.student.college }).populate(
      "author",
      "name rollNo avatarColor department"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, college: req.student.college });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const studentId = req.student.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === studentId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== studentId);
    } else {
      post.likes.push(studentId);
    }

    await post.save();
    res.status(200).json({ likesCount: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, college: req.student.college });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.student.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createPost, getFeed, getPostById, toggleLike, deletePost };
