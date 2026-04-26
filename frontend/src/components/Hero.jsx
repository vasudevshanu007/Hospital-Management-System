import React from "react";
import { motion } from "framer-motion";
import { Heart, Stethoscope, Activity, Shield, Calendar, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = ({ title, imageUrl }) => {
  const navigate = useNavigate();

  const leftVariants = {
    hidden:  { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };
  const rightVariants = {
    hidden:  { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut", delay: 0.15 } },
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    { icon: Heart,       label: "Expert Care",   color: "#ef4444" },
    { icon: Stethoscope, label: "Advanced Tech",  color: "#0d9488" },
    { icon: Activity,    label: "24/7 Service",   color: "#059669" },
    { icon: Shield,      label: "Safe & Secure",  color: "#d97706" },
  ];

  return (
    <section
      style={{
        background: "linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 40%, #d1fae5 70%, #f0fdf4 100%)",
        paddingTop: 88,       /* navbar height (68) + 20px gap */
        paddingBottom: 60,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle bg blobs */}
      <div style={{
        position: "absolute", top: 40, right: 80, width: 280, height: 280,
        borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", bottom: 20, left: 40, width: 200, height: 200,
        borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
        className="hero-grid"
        >

          {/* ── LEFT ── */}
          <motion.div
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
            variants={leftVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              style={{
                display: "inline-flex", alignItems: "center", width: "fit-content",
                padding: "7px 16px", borderRadius: 999,
                background: "rgba(13,148,136,0.10)",
                color: "#0f766e",
                border: "1px solid rgba(13,148,136,0.22)",
                fontSize: 13, fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#0d9488", marginRight: 8, flexShrink: 0,
                animation: "pulse 2s infinite",
              }} />
              Accepting New Patients
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              style={{
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                lineHeight: 1.25,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {title}
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              style={{
                fontSize: 15, lineHeight: 1.75, color: "#475569",
                maxWidth: 480, margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Vasudev Healthcare Medical Institute is a state-of-the-art facility dedicated to
              providing comprehensive healthcare services with compassion and expertise.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <button
                onClick={() => navigate("/appointment")}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 10,
                  background: "linear-gradient(135deg, #0d9488, #059669)",
                  color: "#fff", border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: 14,
                  boxShadow: "0 4px 16px rgba(13,148,136,0.30)",
                  transition: "all 0.2s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,148,136,0.40)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(13,148,136,0.30)"; }}
              >
                <Calendar style={{ width: 16, height: 16 }} />
                Book Appointment
              </button>

              <button
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 10,
                  background: "#fff", color: "#334155",
                  border: "1.5px solid #99f6e4", cursor: "pointer",
                  fontWeight: 600, fontSize: 14,
                  transition: "all 0.2s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0d9488"; e.currentTarget.style.color = "#0d9488"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#99f6e4"; e.currentTarget.style.color = "#334155"; }}
              >
                <Phone style={{ width: 16, height: 16 }} />
                +91 82359 16360
              </button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              variants={itemVariants}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
            >
              {features.map((f) => (
                <div
                  key={f.label}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 14px", background: "#fff",
                    borderRadius: 12, border: "1px solid #e2f8f4",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(13,148,136,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; }}
                >
                  <f.icon style={{ width: 18, height: 18, flexShrink: 0, color: f.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155", fontFamily: "'Inter',sans-serif" }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT (image + stat badges) ── */}
          <motion.div
            variants={rightVariants}
            initial="hidden"
            animate="visible"
            style={{ position: "relative" }}
          >
            {/* Glow behind image */}
            <div style={{
              position: "absolute",
              inset: -16,
              borderRadius: 28,
              background: "linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(5,150,105,0.08) 100%)",
              filter: "blur(24px)",
              zIndex: 0,
            }} />

            {/* Image */}
            <img
              src={imageUrl}
              alt="Healthcare Hero"
              style={{
                position: "relative",
                width: "100%",
                height: "auto",
                maxHeight: 420,
                objectFit: "cover",
                borderRadius: 22,
                boxShadow: "0 20px 50px rgba(13,148,136,0.18)",
                display: "block",
                zIndex: 1,
              }}
            />

            {/* Stat badge — top-left, inside the image container (no negative margins) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: 16, left: 16,
                background: "#fff",
                borderRadius: 14,
                padding: "10px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                border: "1px solid #ccfbf1",
                zIndex: 2,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0d9488", fontFamily: "'Poppins',sans-serif" }}>15+</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Years Experience</div>
            </motion.div>

            {/* Stat badge — bottom-right, inside the image container */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: 16, right: 16,
                background: "#fff",
                borderRadius: 14,
                padding: "10px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                border: "1px solid #d1fae5",
                zIndex: 2,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: "#059669", fontFamily: "'Poppins',sans-serif" }}>10K+</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Happy Patients</div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Responsive grid collapse */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
