import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = "https://vasudev-hospital-management-system.onrender.com/api/v1";

const actionColor = {
  CREATE: "#38a169", UPDATE: "#3182ce", DELETE: "#e53e3e",
  LOGIN: "#2b6cb0", PAYMENT: "#805ad5", RESTOCK: "#d69e2e",
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ action: "", resource: "" });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filters.action) params.append("action", filters.action);
      if (filters.resource) params.append("resource", filters.resource);

      const res = await axios.get(`${API}/analytics/audit-logs?${params}`, { withCredentials: true });
      setLogs(res.data.logs || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, filters]);

  const resources = ["Appointment", "MedicalRecord", "Prescription", "LabReport", "Invoice", "Inventory", "User"];
  const actions = ["CREATE", "UPDATE", "DELETE", "LOGIN", "PAYMENT", "RESTOCK"];

  return (
    <div className="page">
      <div className="dashboard">
        <div className="banner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <h4 style={{ margin: 0 }}>Audit Logs <small style={{ color: "#718096", fontSize: 14 }}>({total} total)</small></h4>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={filters.action} onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}
                style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <option value="">All Actions</option>
                {actions.map((a) => <option key={a}>{a}</option>)}
              </select>
              <select value={filters.resource} onChange={(e) => { setFilters({ ...filters, resource: e.target.value }); setPage(1); }}
                style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <option value="">All Resources</option>
                {resources.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {loading ? <p>Loading...</p> : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? logs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ fontSize: 12 }}>{log.userEmail}</td>
                      <td>{log.userRole}</td>
                      <td>
                        <span style={{ color: actionColor[log.action] || "#2d3748", fontWeight: 600, fontSize: 12 }}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.resource}</td>
                      <td style={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.details || "—"}
                      </td>
                      <td>
                        <span className={log.status === "Success" ? "green" : "red"} style={{ fontWeight: 600, fontSize: 12 }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: "#718096" }}>{log.ipAddress || "—"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} style={{ textAlign: "center" }}>No logs found</td></tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                <button className="export-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ alignSelf: "center" }}>Page {page} of {pages}</span>
                <button className="export-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
