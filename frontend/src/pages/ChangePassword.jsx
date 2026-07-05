import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { student, updateStudent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/change-password", { newPassword });
      updateStudent(res.data.student);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Set your password</h1>
        <p className="auth-subtitle">
          {student ? `Hey ${student.name.split(" ")[0]}, ` : ""}
          you're currently using the default password your admin gave everyone. Pick a password
          only you know before continuing.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save password & continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
