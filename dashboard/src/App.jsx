import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import AddNewAdmin from "./components/AddNewAdmin";
import Sidebar from "./components/Sidebar";
import Chatbot from "./components/Chatbot";
import Billing from "./components/Billing";
import Inventory from "./components/Inventory";
import AuditLogs from "./components/AuditLogs";
import MedicalRecordsAdmin from "./components/MedicalRecordsAdmin";

import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

/* ==============================
   TOP BAR — always visible
============================== */
const TopBar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/api/v1/user/admin/logout", {
        withCredentials: true,
      });
      setIsAuthenticated(false);
      navigate("/login");
    } catch {}
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "#ffffff",
        color: "#0f172a",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px 0 100px",
        boxShadow: "0 1px 0 #e2e8f0, 0 4px 16px rgba(0,0,0,0.04)",
        borderBottom: "1px solid #e2e8f0",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #0d9488, #059669)",
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 16 }}>🏥</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", letterSpacing: 0.2 }}>
          HealthCare Admin
        </span>
      </div>

      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          style={{
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "7px 20px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
            transition: "all 0.2s",
          }}
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "linear-gradient(135deg, #0d9488, #059669)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "7px 20px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 2px 8px rgba(13,148,136,0.25)",
          }}
        >
          Login
        </button>
      )}
    </div>
  );
};

/* ==============================
   APP CONTENT
============================== */
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      <TopBar />
      {!isLoginPage && <Sidebar />}

      <div style={{ paddingTop: 52 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/doctor/addnew" element={<AddNewDoctor />} />
          <Route path="/admin/addnew" element={<AddNewAdmin />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/medical-records" element={<MedicalRecordsAdmin />} />
        </Routes>
      </div>

      {!isLoginPage && <Chatbot role="admin" />}
      <ToastContainer position="top-center" />
    </>
  );
};

/* ==============================
   MAIN APP
============================== */
const App = () => {
  const { isAuthenticated, setIsAuthenticated, setAdmin } = useContext(Context);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/user/admin/me",
          { withCredentials: true }
        );
        setIsAuthenticated(true);
        setAdmin(response.data.user);
      } catch {
        setIsAuthenticated(false);
        setAdmin({});
      }
    };
    fetchAdmin();
  }, [isAuthenticated]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
