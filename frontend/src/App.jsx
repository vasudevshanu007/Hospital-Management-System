import React, { useContext, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./Pages/Home";
import Appointment from "./Pages/Appointment";
import AboutUs from "./Pages/AboutUs";
import Register from "./Pages/Register";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main";
import Login from "./Pages/Login";
import Chatbot from "./components/Chatbot";
import MyMedicalRecords from "./Pages/MyMedicalRecords";
import MyPrescriptions from "./Pages/MyPrescriptions";
import MyBills from "./Pages/MyBills";
import PageTransition from "./components/PageTransition";

const AppContent = () => {
  const location = useLocation();
  const hideChatbot =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      <Navbar />

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/appointment" element={<PageTransition><Appointment /></PageTransition>} />
            <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/my-records" element={<PageTransition><MyMedicalRecords /></PageTransition>} />
            <Route path="/my-prescriptions" element={<PageTransition><MyPrescriptions /></PageTransition>} />
            <Route path="/my-bills" element={<PageTransition><MyBills /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <ToastContainer position="top-center" />
      {!hideChatbot && <Chatbot role="patient" />}
    </>
  );
};

const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://vasudev-hospital-management-system.onrender.com/api/v1/user/patient/me",
          { withCredentials: true }
        );
        setIsAuthenticated(true);
        setUser(response.data.user);
      } catch {
        setIsAuthenticated(false);
        setUser({});
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
