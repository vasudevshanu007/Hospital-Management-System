import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const API = "http://localhost:5000/api/v1";

const statusColor = { Active: "#38a169", Completed: "#3182ce", Cancelled: "#e53e3e" };

const MyPrescriptions = () => {
  const { user, isAuthenticated } = useContext(Context);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/prescriptions/patient/${user._id}`, { withCredentials: true });
        setPrescriptions(res.data.prescriptions || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isAuthenticated]);

  const downloadPDF = async (id) => {
    try {
      window.open(`${API}/prescriptions/${id}/pdf`, "_blank");
    } catch {
      toast.error("Could not download PDF");
    }
  };

  if (!isAuthenticated) return (
    <div className="patient-portal-page">
      <p style={{ textAlign: "center", padding: 40 }}>Please <a href="/login">login</a> to view your prescriptions.</p>
    </div>
  );

  return (
    <div className="patient-portal-page">
      <div className="portal-container">
        <h2 className="portal-title">My Prescriptions</h2>
        <p className="portal-subtitle">Digital prescriptions issued by your doctors.</p>

        {loading ? (
          <div className="portal-loading">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="portal-empty">No prescriptions found.</div>
        ) : (
          <div className="records-grid">
            {prescriptions.map((p) => (
              <div key={p._id} className="record-card">
                <div className="record-card-header">
                  <span className="record-badge"
                    style={{ background: statusColor[p.status] + "22", color: statusColor[p.status] }}>
                    {p.status}
                  </span>
                  <span className="record-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>

                {p.doctorId && (
                  <p className="record-doctor">Dr. {p.doctorId.firstName} {p.doctorId.lastName} — {p.doctorId.doctorDepartment}</p>
                )}

                {p.diagnosis && <p style={{ color: "#4a5568", fontSize: 14, marginBottom: 8 }}>Diagnosis: {p.diagnosis}</p>}

                <button
                  className="portal-btn portal-btn-outline"
                  onClick={() => setExpanded(expanded === p._id ? null : p._id)}
                  style={{ marginRight: 8 }}
                >
                  {expanded === p._id ? "Hide Medicines" : `View ${p.medicines?.length || 0} Medicine(s)`}
                </button>
                <button className="portal-btn" onClick={() => downloadPDF(p._id)}>
                  Download PDF
                </button>

                {expanded === p._id && (
                  <div style={{ marginTop: 14 }}>
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.medicines.map((m, i) => (
                          <tr key={i}>
                            <td><strong>{m.name}</strong></td>
                            <td>{m.dosage}</td>
                            <td>{m.frequency}</td>
                            <td>{m.duration}</td>
                            <td>{m.instructions || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {p.notes && <p style={{ fontSize: 13, color: "#718096", marginTop: 8 }}>Notes: {p.notes}</p>}
                    {p.followUpDate && <p style={{ fontSize: 13, color: "#2b6cb0", marginTop: 4 }}>Follow-up: {new Date(p.followUpDate).toLocaleDateString()}</p>}
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

export default MyPrescriptions;
