import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import "../App.css";

const API = "https://vasudev-hospital-management-system.onrender.com/api/v1";
const COLORS = ["#2b6cb0", "#38a169", "#e53e3e", "#d69e2e", "#805ad5", "#319795", "#dd6b20", "#d53f8c", "#3182ce"];

const StatCard = ({ label, value, color = "#2b6cb0" }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <p>{label}</p>
    <h3 style={{ color }}>{value ?? "—"}</h3>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [apptTrend, setApptTrend] = useState([]);
  const [revTrend, setRevTrend] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statsRes, apptRes, revRes, deptRes, allAppts] = await Promise.all([
        axios.get(`${API}/analytics/stats`, { withCredentials: true }),
        axios.get(`${API}/analytics/appointments/trend`, { withCredentials: true }),
        axios.get(`${API}/analytics/revenue/trend`, { withCredentials: true }),
        axios.get(`${API}/analytics/departments`, { withCredentials: true }),
        axios.get(`${API}/appointment/getall`, { withCredentials: true }),
      ]);
      setStats(statsRes.data.stats);
      setApptTrend(apptRes.data.trend);
      setRevTrend(revRes.data.trend);
      setDeptStats(deptRes.data.stats);
      setAppointments(allAppts.data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/appointment/update/${id}`, { status }, { withCredentials: true });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const updateVisited = async (id, hasVisited) => {
    try {
      await axios.put(`${API}/appointment/update/${id}`, { hasVisited }, { withCredentials: true });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="page"><p style={{ padding: 40 }}>Loading dashboard...</p></div>;

  return (
    <div className="page">
      <div className="dashboard">

        {/* ===== WELCOME BANNER ===== */}
        <div className="banner">
          <div className="firstBox">
            <img src="/doc.png" alt="admin" />
            <div className="content">
              <div><p>Hello,</p><h5>Admin</h5></div>
              <p>Welcome to HealthCare Hospital Management System. Here's your daily overview.</p>
            </div>
          </div>
          <div className="secondBox">
            <p>Today's Appointments</p>
            <h3>{stats?.todayAppointments ?? 0}</h3>
          </div>
          <div className="thirdBox">
            <p>Pending Appointments</p>
            <h3>{stats?.pendingAppointments ?? 0}</h3>
          </div>
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="stats-grid">
          <StatCard label="Total Patients" value={stats?.totalPatients} color="#2b6cb0" />
          <StatCard label="Total Doctors" value={stats?.totalDoctors} color="#38a169" />
          <StatCard label="Total Appointments" value={stats?.totalAppointments} color="#805ad5" />
          <StatCard label="Prescriptions" value={stats?.totalPrescriptions} color="#d69e2e" />
          <StatCard label="Lab Reports" value={stats?.totalLabReports} color="#319795" />
          <StatCard label="Total Revenue" value={`₹${stats?.totalRevenue ?? 0}`} color="#dd6b20" />
          <StatCard label="This Month Revenue" value={`₹${stats?.monthRevenue ?? 0}`} color="#3182ce" />
          <StatCard label="Low Stock Items" value={stats?.lowStockCount} color="#e53e3e" />
        </div>

        {/* ===== CHARTS ROW ===== */}
        <div className="charts-row">
          {/* Appointment Trend */}
          <div className="chart-box">
            <h5>Appointment Trend (7 days)</h5>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={apptTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2b6cb0" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="chart-box">
            <h5>Appointments by Department</h5>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptStats} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={80} label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}>
                  {deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="chart-box" style={{ marginBottom: 24 }}>
          <h5>Monthly Revenue (₹)</h5>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(v) => `₹${v}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#38a169" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ===== APPOINTMENTS TABLE ===== */}
        <div className="banner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <h5 style={{ margin: 0 }}>All Appointments</h5>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="export-btn" onClick={() => window.open(`${API}/user/export-patients`, "_blank")}>Export Patients</button>
              <button className="export-btn" onClick={() => window.open(`${API}/user/export-doctors`, "_blank")}>Export Doctors</button>
              <button className="export-btn" onClick={() => window.open(`${API}/appointment/export-appointments`, "_blank")}>Export Appointments</button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Status</th>
                <th>Visited</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((item) => (
                  <tr key={item._id}>
                    <td>{item.firstName} {item.lastName}</td>
                    <td>{item.appointment_date}</td>
                    <td>{item.doctor?.firstName} {item.doctor?.lastName}</td>
                    <td>{item.department}</td>
                    <td>
                      {item.status === "Accepted" ? (
                        <span className="green">Accepted</span>
                      ) : item.status === "Rejected" ? (
                        <span className="red">Rejected</span>
                      ) : (
                        <>
                          <span className="green" style={{ cursor: "pointer", marginRight: 10 }} onClick={() => updateStatus(item._id, "Accepted")}>✔</span>
                          <span className="red" style={{ cursor: "pointer" }} onClick={() => updateStatus(item._id, "Rejected")}>✖</span>
                        </>
                      )}
                    </td>
                    <td>
                      <span style={{ cursor: "pointer" }} className={item.hasVisited ? "green" : "red"}
                        onClick={() => updateVisited(item._id, !item.hasVisited)}>
                        {item.hasVisited ? "✔" : "✖"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ textAlign: "center" }}>No Appointments Found</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
