import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "http://localhost:5000/api/v1";

const MedicalRecordsAdmin = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    patientId: "", recordType: "Diagnosis", title: "", description: "",
    diagnosis: "", notes: "",
    vitals: { bloodPressure: "", heartRate: "", temperature: "", weight: "", height: "" },
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API}/medical-records/all`, { withCredentials: true });
      setRecords(res.data.records || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/medical-records/create`, form, { withCredentials: true });
      toast.success("Record created!");
      setShowCreate(false);
      setForm({ patientId: "", recordType: "Diagnosis", title: "", description: "", diagnosis: "", notes: "", vitals: { bloodPressure: "", heartRate: "", temperature: "", weight: "", height: "" } });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API}/medical-records/${id}`, { withCredentials: true });
      toast.success("Deleted!");
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const recordTypes = ["Diagnosis", "Allergy", "Vitals", "Notes", "General"];
  const typeColor = { Diagnosis: "#2b6cb0", Allergy: "#e53e3e", Vitals: "#38a169", Notes: "#d69e2e", General: "#805ad5" };

  return (
    <div className="page">
      <div className="dashboard">
        <div className="banner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ margin: 0 }}>Medical Records (EHR)</h4>
            <button className="export-btn" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? "Cancel" : "+ New Record"}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreate} className="ehr-form" style={{ marginBottom: 24 }}>
              <h5>New Medical Record</h5>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
                  <label>Patient ID*</label>
                  <input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required placeholder="Patient MongoDB ID" />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label>Record Type*</label>
                  <select value={form.recordType} onChange={(e) => setForm({ ...form, recordType: e.target.value })}>
                    {recordTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Title*</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              {form.recordType === "Diagnosis" && (
                <div className="form-group">
                  <label>Diagnosis</label>
                  <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
                </div>
              )}
              {form.recordType === "Vitals" && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["bloodPressure", "heartRate", "temperature", "weight", "height"].map((v) => (
                    <div key={v} className="form-group" style={{ flex: 1, minWidth: 110 }}>
                      <label style={{ textTransform: "capitalize" }}>{v.replace(/([A-Z])/g, " $1")}</label>
                      <input value={form.vitals[v]} onChange={(e) => setForm({ ...form, vitals: { ...form.vitals, [v]: e.target.value } })} />
                    </div>
                  ))}
                </div>
              )}
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" className="export-btn" style={{ background: "#2b6cb0", color: "#fff" }}>Save Record</button>
            </form>
          )}

          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr><th>Type</th><th>Title</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {records.length > 0 ? records.map((r) => (
                  <tr key={r._id}>
                    <td><span style={{ color: typeColor[r.recordType], fontWeight: 600 }}>{r.recordType}</span></td>
                    <td>{r.title}</td>
                    <td>{r.patientId?.firstName} {r.patientId?.lastName}</td>
                    <td>{r.doctorId ? `Dr. ${r.doctorId.firstName} ${r.doctorId.lastName}` : "—"}</td>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>
                      <button className="export-btn" style={{ padding: "4px 8px", fontSize: 12, color: "#e53e3e" }}
                        onClick={() => handleDelete(r._id)}>Delete</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} style={{ textAlign: "center" }}>No records found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsAdmin;
