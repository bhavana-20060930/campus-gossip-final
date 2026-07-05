import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [defaultPassword, setDefaultPassword] = useState("vvit@123");
  const [uploadResult, setUploadResult] = useState(null);
  const [students, setStudents] = useState([]);
  const [collegeFilter, setCollegeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Manual add-single-student form
  const [manual, setManual] = useState({ rollNo: "", name: "", department: "", year: "", college: "VVITU" });
  const navigate = useNavigate();

  const loadStudents = async () => {
    try {
      const res = await api.get("/admin/students", { params: collegeFilter ? { college: collegeFilter } : {} });
      setStudents(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin");
      }
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("defaultPassword", defaultPassword);
    try {
      const res = await api.post("/admin/upload-rolllist", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(res.data);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/students", { ...manual, defaultPassword });
      setManual({ rollNo: "", name: "", department: "", year: "", college: manual.college });
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add student");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  return (
    <div className="page">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button className="btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <h3>Upload roll number CSV</h3>
          <p className="note-meta">
            Columns expected: <code>rollNo, name, department, year, college</code>
          </p>
          <p className="note-meta">
            Everyone gets logged in with the same default password below, then they're forced to
            set their own the first time they log in.
          </p>
          <form onSubmit={handleUpload} className="auth-form">
            <label>
              Default password for this batch
              <input
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                placeholder="vvit@123"
              />
            </label>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
            <button className="btn-primary" type="submit" disabled={!file || loading}>
              {loading ? "Uploading..." : "Upload CSV"}
            </button>
          </form>
          {uploadResult && (
            <p className="upload-result">
              ✅ {uploadResult.created} added, {uploadResult.skipped} skipped (already existed or
              invalid row). Default password: <strong>{uploadResult.defaultPasswordUsed}</strong>
            </p>
          )}
          {error && <p className="form-error">{error}</p>}
        </section>

        <section className="admin-card">
          <h3>Add a single student</h3>
          <form onSubmit={handleManualAdd} className="auth-form">
            <input
              placeholder="Roll number"
              value={manual.rollNo}
              onChange={(e) => setManual({ ...manual, rollNo: e.target.value })}
              required
            />
            <input
              placeholder="Full name"
              value={manual.name}
              onChange={(e) => setManual({ ...manual, name: e.target.value })}
              required
            />
            <input
              placeholder="Department"
              value={manual.department}
              onChange={(e) => setManual({ ...manual, department: e.target.value })}
            />
            <input
              placeholder="Year"
              value={manual.year}
              onChange={(e) => setManual({ ...manual, year: e.target.value })}
            />
            <input
              placeholder="College code"
              value={manual.college}
              onChange={(e) => setManual({ ...manual, college: e.target.value })}
            />
            <button className="btn-primary" type="submit">
              Add student
            </button>
          </form>
        </section>
      </div>

      <section className="admin-card">
        <div className="admin-list-header">
          <h3>Whitelisted students ({students.length})</h3>
          <input
            placeholder="Filter by college code"
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadStudents()}
          />
          <button className="btn-ghost small" onClick={loadStudents}>
            Filter
          </button>
        </div>
        <table className="student-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Dept</th>
              <th>Year</th>
              <th>College</th>
              <th>Password status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td>{s.rollNo}</td>
                <td>{s.name}</td>
                <td>{s.department}</td>
                <td>{s.year}</td>
                <td>{s.college}</td>
                <td>{s.mustChangePassword ? "⏳ still default" : "✅ own password set"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
