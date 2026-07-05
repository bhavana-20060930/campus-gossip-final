import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { StudentRoute, AdminRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Feed from "./pages/Feed";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/change-password"
          element={
            <StudentRoute>
              <ChangePassword />
            </StudentRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <StudentRoute>
              <Feed />
            </StudentRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <StudentRoute>
              <PostDetail />
            </StudentRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <StudentRoute>
              <Profile />
            </StudentRoute>
          }
        />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </>
  );
}

export default App;
