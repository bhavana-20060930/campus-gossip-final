import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { student, logoutStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutStudent();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/feed" className="navbar-brand">
        <span className="pin-dot" />
        CampusGossip
        {student && <span className="navbar-college">/{student.college}</span>}
      </Link>

      {student && (
        <div className="navbar-right">
          <Link to="/feed" className="navbar-link">
            Board
          </Link>
          <Link to="/profile" className="navbar-link">
            {student.name.split(" ")[0]}
          </Link>
          <button className="btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
