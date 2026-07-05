import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const AdminLogin = () => {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { secret });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Admin portal</h1>
        <p className="auth-subtitle">Enter the admin secret key to manage the roll number whitelist.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Admin secret
            <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/login">← Back to student login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
