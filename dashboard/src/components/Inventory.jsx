import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "http://localhost:5000/api/v1";

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [filterLow, setFilterLow] = useState(false);

  const [form, setForm] = useState({
    medicineName: "", genericName: "", category: "Tablet",
    manufacturer: "", unit: "units", stockQuantity: 0,
    minStockLevel: 10, unitPrice: 0, expiryDate: "", batchNumber: "", description: "",
  });

  const fetchMedicines = async () => {
    try {
      const res = await axios.get(`${API}/inventory${filterLow ? "?lowStock=true" : ""}`, { withCredentials: true });
      setMedicines(res.data.medicines || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, [filterLow]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/inventory/add`, form, { withCredentials: true });
      toast.success("Medicine added!");
      setShowAdd(false);
      setForm({ medicineName: "", genericName: "", category: "Tablet", manufacturer: "", unit: "units", stockQuantity: 0, minStockLevel: 10, unitPrice: 0, expiryDate: "", batchNumber: "", description: "" });
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add medicine");
    }
  };

  const handleRestock = async (id) => {
    if (!restockQty || Number(restockQty) <= 0) return toast.error("Enter valid quantity");
    try {
      await axios.patch(`${API}/inventory/${id}/restock`, { quantity: restockQty }, { withCredentials: true });
      toast.success("Restocked!");
      setRestockId(null);
      setRestockQty("");
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || "Restock failed");
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Remove this medicine from active inventory?")) return;
    try {
      await axios.delete(`${API}/inventory/${id}`, { withCredentials: true });
      toast.success("Removed!");
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const categories = ["Tablet", "Syrup", "Injection", "Capsule", "Cream", "Drops", "Other"];

  return (
    <div className="page">
      <div className="dashboard">
        <div className="banner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <h4 style={{ margin: 0 }}>Pharmacy Inventory</h4>
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                <input type="checkbox" checked={filterLow} onChange={(e) => setFilterLow(e.target.checked)} />
                Low Stock Only
              </label>
              <button className="export-btn" onClick={() => setShowAdd(!showAdd)}>
                {showAdd ? "Cancel" : "+ Add Medicine"}
              </button>
            </div>
          </div>

          {showAdd && (
            <form onSubmit={handleAdd} className="ehr-form" style={{ marginBottom: 24 }}>
              <h5>Add Medicine</h5>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[["Medicine Name*", "medicineName", "text"], ["Generic Name", "genericName", "text"],
                  ["Manufacturer", "manufacturer", "text"], ["Unit", "unit", "text"],
                  ["Stock Qty*", "stockQuantity", "number"], ["Min Level", "minStockLevel", "number"],
                  ["Unit Price* (₹)", "unitPrice", "number"], ["Expiry Date", "expiryDate", "date"],
                  ["Batch Number", "batchNumber", "text"]].map(([label, key, type]) => (
                  <div key={key} className="form-group" style={{ flex: 1, minWidth: 160 }}>
                    <label>{label}</label>
                    <input type={type} value={form[key]} min={type === "number" ? 0 : undefined}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required={label.includes("*")} />
                  </div>
                ))}
                <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
                  <label>Category*</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="export-btn" style={{ background: "#2b6cb0", color: "#fff" }}>Add to Inventory</button>
            </form>
          )}

          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Min Level</th>
                  <th>Unit Price</th>
                  <th>Expiry</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length > 0 ? medicines.map((m) => (
                  <tr key={m._id}>
                    <td><strong>{m.medicineName}</strong>{m.genericName && <small style={{ color: "#718096" }}><br />{m.genericName}</small>}</td>
                    <td>{m.category}</td>
                    <td>{m.stockQuantity} {m.unit}</td>
                    <td>{m.minStockLevel}</td>
                    <td>₹{m.unitPrice}</td>
                    <td>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : "N/A"}</td>
                    <td>
                      {m.isLowStock
                        ? <span className="red" style={{ fontWeight: 600 }}>⚠ Low Stock</span>
                        : <span className="green">OK</span>}
                    </td>
                    <td>
                      {restockId === m._id ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <input type="number" min="1" placeholder="Qty" value={restockQty}
                            onChange={(e) => setRestockQty(e.target.value)} style={{ width: 60 }} />
                          <button className="export-btn" style={{ padding: "4px 8px", fontSize: 12 }}
                            onClick={() => handleRestock(m._id)}>OK</button>
                          <button className="export-btn" style={{ padding: "4px 8px", fontSize: 12 }}
                            onClick={() => setRestockId(null)}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="export-btn" style={{ padding: "4px 8px", fontSize: 12 }}
                            onClick={() => setRestockId(m._id)}>Restock</button>
                          <button className="export-btn" style={{ padding: "4px 8px", fontSize: 12, color: "#e53e3e" }}
                            onClick={() => handleDeactivate(m._id)}>Remove</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan={8} style={{ textAlign: "center" }}>No medicines found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
