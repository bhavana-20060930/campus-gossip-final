import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const NOTE_COLORS = ["note-yellow", "note-pink", "note-mint", "note-blue"];

const colorForId = (id) => {
  const sum = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return NOTE_COLORS[sum % NOTE_COLORS.length];
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const PostCard = ({ post, onDeleted, linkToDetail = true }) => {
  const { student } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(student?.id));
  const [busy, setBusy] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setLikesCount(res.data.likesCount);
      setLiked(res.data.liked);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDeleted?.(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  const isOwner = student && post.author?._id === student.id;
  const noteColor = colorForId(post._id);

  const Wrapper = ({ children }) =>
    linkToDetail ? (
      <Link to={`/post/${post._id}`} className={`note ${noteColor}`}>
        {children}
      </Link>
    ) : (
      <div className={`note ${noteColor}`}>{children}</div>
    );

  return (
    <Wrapper>
      <span className="pin" aria-hidden="true" />
      <div className="note-header">
        <div className="avatar" style={{ background: post.author?.avatarColor || "#7C3AED" }}>
          {post.author?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="note-header-text">
          <span className="note-author">{post.author?.name}</span>
          <span className="note-meta">
            {post.author?.rollNo} · {timeAgo(post.createdAt)}
          </span>
        </div>
        {isOwner && (
          <button className="note-delete" onClick={handleDelete} title="Delete post">
            ✕
          </button>
        )}
      </div>

      <p className="note-text">{post.text}</p>

      {post.imageUrl && <img src={post.imageUrl} alt="" className="note-image" />}

      <div className="note-footer">
        <button className={`note-action ${liked ? "liked" : ""}`} onClick={handleLike}>
          {liked ? "♥" : "♡"} {likesCount}
        </button>
        <span className="note-action" style={{ pointerEvents: "none" }}>
          💬 {post.commentCount ?? 0}
        </span>
      </div>
    </Wrapper>
  );
};

export default PostCard;
