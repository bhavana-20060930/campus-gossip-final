import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("studentInfo");
    if (stored) {
      setStudent(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const loginStudent = (token, studentData) => {
    localStorage.setItem("studentToken", token);
    localStorage.setItem("studentInfo", JSON.stringify(studentData));
    setStudent(studentData);
  };

  const logoutStudent = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentInfo");
    setStudent(null);
  };

  const updateStudent = (studentData) => {
    localStorage.setItem("studentInfo", JSON.stringify(studentData));
    setStudent(studentData);
  };

  return (
    <AuthContext.Provider value={{ student, loginStudent, logoutStudent, updateStudent, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
