import { useEffect, useState } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch (err) {
      setError("Couldn't load the board. Try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    setError("");
    try {
      const res = await api.post("/posts", { text, imageUrl: imageUrl || undefined });
      setPosts((prev) => [res.data, ...prev]);
      setText("");
      setImageUrl("");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't pin your post");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleted = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="page">
      <form className="composer" onSubmit={handlePost}>
        <textarea
          placeholder="What's the gossip today? 👀"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          rows={3}
        />
        <div className="composer-row">
          <input
            className="composer-image-input"
            placeholder="Optional image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={posting || !text.trim()}>
            {posting ? "Pinning..." : "Pin it 📌"}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>

      {loading ? (
        <p className="empty-state">Loading the board...</p>
      ) : posts.length === 0 ? (
        <p className="empty-state">Nothing's pinned yet. Be the first to post something!</p>
      ) : (
        <div className="board">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
