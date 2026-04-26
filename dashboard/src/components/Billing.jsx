import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "http://localhost:5000/api/v1";

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    patientId: "",
    services: [{ description: "", quantity: 1, unitPrice: 0 }],
    tax: 0,
    discount: 0,
    notes: "",
    dueDate: "",
  });

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API}/invoices/all`, { withCredentials: true });
      setInvoices(res.data.invoices || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API}/user/export-patients`, { withCredentials: true });
      // fallback: use doctors endpoint pattern — actually just get from appointments
    } catch {}
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const addService = () =>
    setForm((f) => ({ ...f, services: [...f.services, { description: "", quantity: 1, unitPrice: 0 }] }));

  const removeService = (i) =>
    setForm((f) => ({ ...f, services: f.services.filter((_, idx) => idx !== i) }));

  const updateService = (i, field, value) =>
    setForm((f) => {
      const services = [...f.services];
      services[i] = { ...services[i], [field]: field === "description" ? value : Number(value) };
      return { ...f, services };
    });

  const subtotal = form.services.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const total = subtotal + Number(form.tax) - Number(form.discount);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/invoices/create`, { ...form, totalAmount: total }, { withCredentials: true });
      toast.success("Invoice created!");
      setShowCreate(false);
      setForm({ patientId: "", services: [{ description: "", quantity: 1, unitPrice: 0 }], tax: 0, discount: 0, notes: "", dueDate: "" });
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create invoice");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/invoices/${id}`, { status }, { withCredentials: true });
      toast.success("Invoice updated!");
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const downloadPDF = (id) => window.open(`${API}/invoices/${id}/pdf`, "_blank");

  const statusColor = { Pending: "#d69e2e", Paid: "#38a169", Partial: "#3182ce", Cancelled: "#e53e3e" };

  return (
    <div className="page">
      <div className="dashboard">
        <div className="banner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h4 style={{ margin: 0 }}>Billing & Invoices</h4>
            <button className="export-btn" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? "Cancel" : "+ New Invoice"}
            </button>
          </div>

          {/* Create Invoice Form */}
          {showCreate && (
            <form onSubmit={handleCreate} className="ehr-form" style={{ marginBottom: 24 }}>
              <h5>New Invoice</h5>
              <div className="form-group">
                <label>Patient ID</label>
                <input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} placeholder="Patient MongoDB ID" required />
              </div>

              <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Services</label>
              {form.services.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <input style={{ flex: 3, minWidth: 150 }} placeholder="Description" value={s.description}
                    onChange={(e) => updateService(i, "description", e.target.value)} required />
                  <input style={{ flex: 1, minWidth: 60 }} type="number" placeholder="Qty" min="1" value={s.quantity}
                    onChange={(e) => updateService(i, "quantity", e.target.value)} />
                  <input style={{ flex: 1, minWidth: 80 }} type="number" placeholder="Unit Price ₹" min="0" value={s.unitPrice}
                    onChange={(e) => updateService(i, "unitPrice", e.target.value)} />
                  <span style={{ alignSelf: "center", minWidth: 70 }}>= ₹{s.quantity * s.unitPrice}</span>
                  {form.services.length > 1 && (
                    <button type="button" onClick={() => removeService(i)} style={{ color: "#e53e3e", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addService} className="export-btn" style={{ marginBottom: 12 }}>+ Add Service</button>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tax (₹)</label>
                  <input type="number" min="0" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Discount (₹)</label>
                  <input type="number" min="0" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div style={{ textAlign: "right", marginBottom: 12 }}>
                <strong>Subtotal: ₹{subtotal} | Tax: ₹{form.tax} | Discount: ₹{form.discount} | <span style={{ color: "#2b6cb0" }}>Total: ₹{total}</span></strong>
              </div>
              <button type="submit" className="export-btn" style={{ background: "#2b6cb0", color: "#fff" }}>Create Invoice</button>
            </form>
          )}

          {/* Invoices Table */}
          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Patient</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.patientId?.firstName} {inv.patientId?.lastName}</td>
                    <td>₹{inv.totalAmount}</td>
                    <td>₹{inv.paidAmount}</td>
                    <td><span style={{ color: statusColor[inv.status], fontWeight: 600 }}>{inv.status}</span></td>
                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {inv.status !== "Paid" && inv.status !== "Cancelled" && (
                        <button className="export-btn" style={{ padding: "4px 8px", fontSize: 12 }}
                          onClick={() => updateStatus(inv._id, "Paid")}>Mark Paid</button>
                      )}
                      <button className="export-btn" style={{ padding: "4px 8px", fontSize: 12 }}
                        onClick={() => downloadPDF(inv._id)}>PDF</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={7} style={{ textAlign: "center" }}>No invoices found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
