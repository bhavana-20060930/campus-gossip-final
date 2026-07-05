import { useEffect, useState } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { student } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/posts", { params: { mine: true, limit: 50 } });
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleted = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  if (!student) return null;

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar large" style={{ background: student.avatarColor }}>
          {student.name[0].toUpperCase()}
        </div>
        <div>
          <h2>{student.name}</h2>
          <p className="note-meta">
            {student.rollNo} · {student.department} · Year {student.year}
          </p>
          <p className="note-meta">{student.college}</p>
        </div>
      </div>

      <h3 className="section-title">Your posts</h3>

      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="empty-state">You haven't pinned anything yet.</p>
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

export default Profile;
