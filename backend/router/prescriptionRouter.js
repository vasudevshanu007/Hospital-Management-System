import express from "express";
import {
  createPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescriptionById,
  downloadPrescriptionPDF,
  updatePrescriptionStatus,
  getAllPrescriptions,
} from "../controller/prescriptionController.js";
import {
  isAuthenticated,
  isAuthorized,
  isDoctorAuthenticated,
  isAdminAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// Admin: all prescriptions
router.get("/all", isAdminAuthenticated, getAllPrescriptions);

// Doctor: create prescription
router.post(
  "/create",
  isDoctorAuthenticated,
  createPrescription
);

// Doctor: view their own prescriptions
router.get(
  "/doctor/mine",
  isDoctorAuthenticated,
  getDoctorPrescriptions
);

// Patient: view their prescriptions
router.get(
  "/patient/:patientId",
  isAuthenticated,
  getPatientPrescriptions
);

// Any authenticated: single prescription
router.get("/:id", isAuthenticated, getPrescriptionById);

// Download PDF
router.get("/:id/pdf", isAuthenticated, downloadPrescriptionPDF);

// Doctor / Admin: update status
router.put(
  "/:id/status",
  isAuthenticated,
  isAuthorized("Doctor", "Admin"),
  updatePrescriptionStatus
);

export default router;
