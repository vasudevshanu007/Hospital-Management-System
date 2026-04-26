import express from "express";
import {
  getDashboardStats,
  getAppointmentTrend,
  getRevenueTrend,
  getDepartmentStats,
  getDoctorPerformance,
  getAuditLogs,
} from "../controller/analyticsController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/stats", isAdminAuthenticated, getDashboardStats);
router.get("/appointments/trend", isAdminAuthenticated, getAppointmentTrend);
router.get("/revenue/trend", isAdminAuthenticated, getRevenueTrend);
router.get("/departments", isAdminAuthenticated, getDepartmentStats);
router.get("/doctors/performance", isAdminAuthenticated, getDoctorPerformance);
router.get("/audit-logs", isAdminAuthenticated, getAuditLogs);

export default router;
