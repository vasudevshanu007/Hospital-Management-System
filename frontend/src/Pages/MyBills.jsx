import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const API = "http://localhost:5000/api/v1";

const statusColor = { Pending: "#d69e2e", Paid: "#38a169", Partial: "#3182ce", Cancelled: "#e53e3e" };

const MyBills = () => {
  const { user, isAuthenticated } = useContext(Context);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/invoices/patient/${user._id}`, { withCredentials: true });
        setInvoices(res.data.invoices || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load bills");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isAuthenticated]);

  const downloadPDF = (id) => window.open(`${API}/invoices/${id}/pdf`, "_blank");

  const handleRazorpayPayment = async (invoice) => {
    try {
      const orderRes = await axios.post(`${API}/invoices/${invoice._id}/razorpay/order`, {}, { withCredentials: true });
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "HealthCare Hospital",
        description: `Invoice ${invoice.invoiceNumber}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await axios.post(`${API}/invoices/razorpay/verify`, response, { withCredentials: true });
            toast.success("Payment successful!");
            const res = await axios.get(`${API}/invoices/patient/${user._id}`, { withCredentials: true });
            setInvoices(res.data.invoices || []);
          } catch {
            toast.error("Payment verification failed!");
          }
        },
        prefill: { name: `${user.firstName} ${user.lastName}`, email: user.email },
        theme: { color: "#2b6cb0" },
      };

      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway not available. Please contact the hospital.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not initiate payment");
    }
  };

  if (!isAuthenticated) return (
    <div className="patient-portal-page">
      <p style={{ textAlign: "center", padding: 40 }}>Please <a href="/login">login</a> to view your bills.</p>
    </div>
  );

  const totalDue = invoices.filter(i => i.status !== "Paid" && i.status !== "Cancelled")
    .reduce((sum, i) => sum + (i.totalAmount - (i.paidAmount || 0)), 0);

  return (
    <div className="patient-portal-page">
      <div className="portal-container">
        <h2 className="portal-title">My Bills & Payments</h2>
        <p className="portal-subtitle">View and pay your hospital invoices securely.</p>

        {totalDue > 0 && (
          <div className="portal-alert">
            Outstanding balance: <strong>₹{totalDue}</strong>
          </div>
        )}

        {loading ? (
          <div className="portal-loading">Loading bills...</div>
        ) : invoices.length === 0 ? (
          <div className="portal-empty">No invoices found.</div>
        ) : (
          <div className="records-grid">
            {invoices.map((inv) => (
              <div key={inv._id} className="record-card">
                <div className="record-card-header">
                  <span className="record-badge"
                    style={{ background: statusColor[inv.status] + "22", color: statusColor[inv.status] }}>
                    {inv.status}
                  </span>
                  <span className="record-date">{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>

                <h4 className="record-title">{inv.invoiceNumber}</h4>

                <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
                  <div><span style={{ fontSize: 12, color: "#718096" }}>Total</span><br /><strong>₹{inv.totalAmount}</strong></div>
                  <div><span style={{ fontSize: 12, color: "#718096" }}>Paid</span><br /><strong style={{ color: "#38a169" }}>₹{inv.paidAmount || 0}</strong></div>
                  <div><span style={{ fontSize: 12, color: "#718096" }}>Due</span><br /><strong style={{ color: "#e53e3e" }}>₹{inv.totalAmount - (inv.paidAmount || 0)}</strong></div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="portal-btn portal-btn-outline"
                    onClick={() => setExpanded(expanded === inv._id ? null : inv._id)}>
                    {expanded === inv._id ? "Hide" : "View Services"}
                  </button>
                  <button className="portal-btn portal-btn-outline" onClick={() => downloadPDF(inv._id)}>
                    PDF
                  </button>
                  {(inv.status === "Pending" || inv.status === "Partial") && (
                    <button className="portal-btn" onClick={() => handleRazorpayPayment(inv)}>
                      Pay Now
                    </button>
                  )}
                </div>

                {expanded === inv._id && (
                  <div style={{ marginTop: 14 }}>
                    <table className="portal-table">
                      <thead>
                        <tr><th>Service</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
                      </thead>
                      <tbody>
                        {inv.services?.map((s, i) => (
                          <tr key={i}>
                            <td>{s.description}</td>
                            <td>{s.quantity}</td>
                            <td>₹{s.unitPrice}</td>
                            <td>₹{s.total || s.quantity * s.unitPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {inv.notes && <p style={{ fontSize: 13, color: "#718096", marginTop: 8 }}>Notes: {inv.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBills;
