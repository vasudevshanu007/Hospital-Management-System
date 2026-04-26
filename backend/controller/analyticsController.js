import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { Invoice } from "../models/invoiceSchema.js";
import { Prescription } from "../models/prescriptionSchema.js";
import { LabReport } from "../models/labReportSchema.js";
import { Inventory } from "../models/inventorySchema.js";
import { AuditLog } from "../models/auditLogSchema.js";

/* =========================
   MAIN DASHBOARD STATS
========================= */
export const getDashboardStats = catchAsyncErrors(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    totalRevenue,
    monthRevenue,
    totalPrescriptions,
    totalLabReports,
    lowStockCount,
    recentAppointments,
    recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments({ role: "Patient" }),
    User.countDocuments({ role: "Doctor" }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
    Appointment.countDocuments({ status: "Pending" }),
    Invoice.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),
    Invoice.aggregate([
      { $match: { status: "Paid", paymentDate: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),
    Prescription.countDocuments(),
    LabReport.countDocuments(),
    Inventory.countDocuments({ isActive: true, $expr: { $lte: ["$stockQuantity", "$minStockLevel"] } }),
    Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName doctorDepartment"),
    AuditLog.find().sort({ createdAt: -1 }).limit(10),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      totalPrescriptions,
      totalLabReports,
      lowStockCount,
    },
    recentAppointments,
    recentAuditLogs,
  });
});

/* =========================
   APPOINTMENT TREND (last 7 days)
========================= */
export const getAppointmentTrend = catchAsyncErrors(async (req, res) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }

  const trend = await Promise.all(
    days.map(async (day) => {
      const next = new Date(day);
      next.setHours(23, 59, 59, 999);
      const count = await Appointment.countDocuments({
        createdAt: { $gte: day, $lte: next },
      });
      return {
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      };
    })
  );

  res.status(200).json({ success: true, trend });
});

/* =========================
   REVENUE TREND (last 6 months)
========================= */
export const getRevenueTrend = catchAsyncErrors(async (req, res) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  const trend = await Promise.all(
    months.map(async (month) => {
      const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      const result = await Invoice.aggregate([
        { $match: { status: "Paid", paymentDate: { $gte: month, $lt: nextMonth } } },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]);
      return {
        month: month.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: result[0]?.total || 0,
      };
    })
  );

  res.status(200).json({ success: true, trend });
});

/* =========================
   DEPARTMENT DISTRIBUTION
========================= */
export const getDepartmentStats = catchAsyncErrors(async (req, res) => {
  const stats = await Appointment.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: stats.map((s) => ({ department: s._id, count: s.count })),
  });
});

/* =========================
   DOCTOR PERFORMANCE
========================= */
export const getDoctorPerformance = catchAsyncErrors(async (req, res) => {
  const stats = await Appointment.aggregate([
    {
      $group: {
        _id: "$doctorId",
        total: { $sum: 1 },
        accepted: { $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
        visited: { $sum: { $cond: ["$hasVisited", 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 10 },
  ]);

  const populated = await User.populate(stats, {
    path: "_id",
    select: "firstName lastName doctorDepartment docAvatar",
  });

  res.status(200).json({
    success: true,
    stats: populated.map((s) => ({
      doctor: s._id,
      total: s.total,
      accepted: s.accepted,
      pending: s.pending,
      rejected: s.rejected,
      visited: s.visited,
    })),
  });
});

/* =========================
   AUDIT LOGS (Admin)
========================= */
export const getAuditLogs = catchAsyncErrors(async (req, res) => {
  const { page = 1, limit = 20, action, resource, userId } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (action) filter.action = action;
  if (resource) filter.resource = resource;
  if (userId) filter.userId = userId;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    logs,
  });
});
