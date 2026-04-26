import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Chatbot = ({ role }) => {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const BASE = "https://vasudev-hospital-management-system.onrender.com";
      const url  = role === "admin"
        ? `${BASE}/api/v1/chatbot/admin`
        : `${BASE}/api/v1/chatbot/user`;

      const { data } = await axios.post(url, { message: userMsg.text }, { withCredentials: true });
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.reply || "Unable to connect. Please try again.";
      setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        title="AI Assistant"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 50, height: 50, borderRadius: "50%", border: "none",
          cursor: "pointer", fontSize: 20,
          background: "linear-gradient(135deg, #0d9488, #059669)",
          boxShadow: "0 6px 20px rgba(13,148,136,0.40)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 86, right: 24, zIndex: 9998,
          width: 330, height: 440,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          border: "1px solid #ccfbf1",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>

          {/* Header */}
          <div style={{
            padding: "13px 16px",
            background: "linear-gradient(135deg, #0d9488, #059669)",
            display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>🤖</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Admin AI Assistant</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#86efac", marginRight: 5, verticalAlign: "middle" }} />
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, padding: "12px 12px 4px",
            overflowY: "auto", display: "flex", flexDirection: "column", gap: 8,
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 20, lineHeight: 1.6 }}>
                👋 Hi Admin! Ask me about appointments, doctors, patients, or analytics.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "8px 12px",
                  borderRadius: m.sender === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  fontSize: 12, lineHeight: 1.55,
                  ...(m.sender === "user"
                    ? { background: "linear-gradient(135deg, #0d9488, #059669)", color: "#fff" }
                    : { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" }),
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "14px 14px 14px 4px", padding: "8px 12px", fontSize: 12, color: "#64748b" }}>
                  Typing…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ display: "flex", borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
              style={{
                flex: 1, padding: "11px 13px", border: "none", outline: "none",
                fontSize: 12, color: "#334155", background: "#fff",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: "11px 16px", border: "none",
                background: loading || !input.trim() ? "#cbd5e1" : "linear-gradient(135deg, #0d9488, #059669)",
                color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: 12, fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
