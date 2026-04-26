import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GiHamburgerMenu } from "react-icons/gi";
import { Heart } from "lucide-react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/user/patient/logout",
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setIsAuthenticated(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const close = () => setShow(false);
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/",            label: "Home" },
    { to: "/appointment", label: "Appointment" },
    { to: "/about",       label: "About Us" },
    ...(isAuthenticated ? [
      { to: "/my-records",       label: "My Records" },
      { to: "/my-prescriptions", label: "Prescriptions" },
      { to: "/my-bills",         label: "Bills" },
    ] : []),
  ];

  return (
    <>
      {/* ── Desktop / Scroll Navbar ── */}
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          height: 68,
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          background: "#ffffff",
          borderBottom: isScrolled
            ? "1px solid #ccfbf1"
            : "1px solid #e2e8f0",
          boxShadow: isScrolled
            ? "0 4px 20px rgba(13,148,136,0.10)"
            : "0 1px 4px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.3s, border-color 0.3s",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div
            style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #0d9488, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(13,148,136,0.30)",
              flexShrink: 0,
            }}
          >
            <Heart style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <div>
            <div
              style={{
                fontWeight: 800, fontSize: 17, lineHeight: 1.2,
                background: "linear-gradient(135deg, #0d9488, #059669)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Vasudev Healthcare
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
              Trusted Since 2010
            </div>
          </div>
        </div>

        {/* Desktop Links */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6,
            marginLeft: "auto",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s",
                ...(isActive(link.to)
                  ? {
                      background: "linear-gradient(135deg, #0d9488, #059669)",
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(13,148,136,0.25)",
                    }
                  : {
                      color: "#334155",
                      background: "transparent",
                    }),
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.background = "#f0fdfa";
                  e.currentTarget.style.color = "#0d9488";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#334155";
                }
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                marginLeft: 8,
                padding: "8px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(220,38,38,0.25)",
                transition: "all 0.2s",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigateTo("/login")}
              style={{
                marginLeft: 8,
                padding: "8px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #0d9488, #059669)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(13,148,136,0.30)",
                transition: "all 0.2s",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setShow(!show)}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 6,
            borderRadius: 8,
            display: "none",
          }}
        >
          <GiHamburgerMenu style={{ fontSize: 22, color: "#334155" }} />
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {show && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              style={{
                position: "fixed", inset: 0, zIndex: 1100,
                background: "rgba(15,23,42,0.45)",
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0,
                width: 280, zIndex: 1200,
                background: "#fff",
                boxShadow: "8px 0 32px rgba(0,0,0,0.15)",
                display: "flex", flexDirection: "column",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: "20px 20px 18px",
                  background: "linear-gradient(135deg, #0d9488, #059669)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Heart style={{ width: 18, height: 18, color: "#fff" }} />
                  </div>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "'Poppins',sans-serif" }}>
                    Vasudev Healthcare
                  </span>
                </div>
                <button
                  onClick={close}
                  style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer" }}
                >
                  <IoMdClose style={{ color: "#fff", fontSize: 18 }} />
                </button>
              </div>

              {/* Drawer Links */}
              <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                {navLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={close}
                    style={{
                      display: "block",
                      padding: "11px 16px",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "all 0.15s",
                      ...(isActive(item.to)
                        ? { background: "linear-gradient(135deg, #0d9488, #059669)", color: "#fff" }
                        : { color: "#334155" }),
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Drawer Footer (Auth) */}
              <div style={{ padding: "16px", borderTop: "1px solid #f1f5f9" }}>
                {isAuthenticated ? (
                  <button
                    onClick={() => { handleLogout(); close(); }}
                    style={{
                      width: "100%", padding: "11px", borderRadius: 10,
                      border: "none", cursor: "pointer", fontWeight: 700,
                      fontSize: 14, color: "#fff",
                      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => { navigateTo("/login"); close(); }}
                    style={{
                      width: "100%", padding: "11px", borderRadius: 10,
                      border: "none", cursor: "pointer", fontWeight: 700,
                      fontSize: 14, color: "#fff",
                      background: "linear-gradient(135deg, #0d9488, #059669)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
