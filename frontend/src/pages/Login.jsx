import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [rollNo, setRollNo] = useState("");
  const [college, setCollege] = useState("VVITU");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { rollNo, college, password });
      loginStudent(res.data.token, res.data.student);
      if (res.data.student.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/feed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">CampusGossip</h1>
        <p className="auth-subtitle">
          Log in with your roll number. New here? Use the default password your admin shared with
          your class — you'll be asked to set your own right after.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Roll number
            <input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="21A91A0501" required />
          </label>
          <label>
            College code
            <input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="VVITU" required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-footer small">
          <Link to="/admin">Admin portal →</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
