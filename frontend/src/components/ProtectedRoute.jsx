import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const StudentRoute = ({ children }) => {
  const { student, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!student) return <Navigate to="/login" replace />;

  if (student.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) return <Navigate to="/admin" replace />;
  return children;
};
