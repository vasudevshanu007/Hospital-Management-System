import express from "express";
import {
  uploadLabReport,
  getPatientLabReports,
  getLabReportById,
  updateLabReport,
  deleteLabReport,
  getAllLabReports,
} from "../controller/labReportController.js";
import {
  isAuthenticated,
  isAuthorized,
  isAdminAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// Admin: all reports
router.get("/all", isAdminAuthenticated, getAllLabReports);

// Admin / Doctor: upload report
router.post(
  "/upload",
  isAuthenticated,
  isAuthorized("Admin", "Doctor"),
  uploadLabReport
);

// Patient / Doctor / Admin: patient reports
router.get(
  "/patient/:patientId",
  isAuthenticated,
  getPatientLabReports
);

// Single report
router.get("/:id", isAuthenticated, getLabReportById);

// Doctor / Admin: update
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("Admin", "Doctor"),
  updateLabReport
);

// Admin only: delete
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteLabReport
);

export default router;
