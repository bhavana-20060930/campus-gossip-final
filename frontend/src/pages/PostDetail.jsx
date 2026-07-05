import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { student } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, { text: commentText });
      setComments((prev) => [...prev, res.data]);
      setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPost((prev) => ({ ...prev, commentCount: Math.max((prev.commentCount || 1) - 1, 0) }));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDeleted = () => {
    navigate("/feed");
  };

  if (loading) return <p className="empty-state">Loading...</p>;
  if (!post) return <p className="empty-state">Post not found.</p>;

  return (
    <div className="page page-narrow">
      <PostCard post={post} onDeleted={handlePostDeleted} linkToDetail={false} />

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>

        <form onSubmit={handleComment} className="comment-form">
          <input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={500}
          />
          <button className="btn-primary small" type="submit" disabled={posting || !commentText.trim()}>
            Post
          </button>
        </form>

        <div className="comment-list">
          {comments.map((c) => (
            <div className="comment" key={c._id}>
              <div className="avatar small" style={{ background: c.author?.avatarColor || "#7C3AED" }}>
                {c.author?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="comment-body">
                <span className="comment-author">
                  {c.author?.name} <span className="note-meta">{c.author?.rollNo}</span>
                </span>
                <p className="comment-text">{c.text}</p>
              </div>
              {student && c.author?._id === student.id && (
                <button className="note-delete" onClick={() => handleDeleteComment(c._id)}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
