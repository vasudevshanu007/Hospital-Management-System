import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const API = "https://vasudev-hospital-management-system.onrender.com/api/v1";

const typeColor = {
  Diagnosis: "#2b6cb0", Allergy: "#e53e3e", Vitals: "#38a169",
  Notes: "#d69e2e", General: "#805ad5",
};

const MyMedicalRecords = () => {
  const { user, isAuthenticated } = useContext(Context);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    const fetchRecords = async () => {
      try {
        const res = await axios.get(`${API}/medical-records/patient/${user._id}`, { withCredentials: true });
        setRecords(res.data.records || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load records");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user, isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="patient-portal-page">
      <p style={{ textAlign: "center", padding: 40 }}>Please <a href="/login">login</a> to view your medical records.</p>
    </div>
  );

  return (
    <div className="patient-portal-page">
      <div className="portal-container">
        <h2 className="portal-title">My Medical Records</h2>
        <p className="portal-subtitle">Your complete health history maintained by our doctors.</p>

        {loading ? (
          <div className="portal-loading">Loading your records...</div>
        ) : records.length === 0 ? (
          <div className="portal-empty">No medical records found. Visit our hospital to get started.</div>
        ) : (
          <div className="records-grid">
            {records.map((r) => (
              <div key={r._id} className="record-card" onClick={() => setSelected(selected?._id === r._id ? null : r)}>
                <div className="record-card-header">
                  <span className="record-badge" style={{ background: typeColor[r.recordType] + "22", color: typeColor[r.recordType] }}>
                    {r.recordType}
                  </span>
                  <span className="record-date">{new Date(r.date).toLocaleDateString()}</span>
                </div>
                <h4 className="record-title">{r.title}</h4>
                {r.doctorId && (
                  <p className="record-doctor">Dr. {r.doctorId.firstName} {r.doctorId.lastName} — {r.doctorId.doctorDepartment}</p>
                )}

                {selected?._id === r._id && (
                  <div className="record-detail">
                    {r.diagnosis && <><p className="detail-label">Diagnosis</p><p>{r.diagnosis}</p></>}
                    {r.description && <><p className="detail-label">Description</p><p>{r.description}</p></>}
                    {r.allergies?.length > 0 && <><p className="detail-label">Allergies</p><p>{r.allergies.join(", ")}</p></>}
                    {r.notes && <><p className="detail-label">Notes</p><p>{r.notes}</p></>}
                    {r.vitals && Object.values(r.vitals).some(Boolean) && (
                      <>
                        <p className="detail-label">Vitals</p>
                        <div className="vitals-grid">
                          {Object.entries(r.vitals).map(([key, val]) => val ? (
                            <div key={key} className="vital-chip">
                              <span>{key.replace(/([A-Z])/g, " $1")}</span>
                              <strong>{val}</strong>
                            </div>
                          ) : null)}
                        </div>
                      </>
                    )}
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

export default MyMedicalRecords;
