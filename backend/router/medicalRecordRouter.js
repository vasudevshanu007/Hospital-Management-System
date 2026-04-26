import express from "express";
import {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getAllMedicalRecords,
} from "../controller/medicalRecordController.js";
import {
  isAuthenticated,
  isAuthorized,
  isAdminAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// Admin: view all records
router.get("/all", isAdminAuthenticated, getAllMedicalRecords);

// Admin / Doctor: create record
router.post(
  "/create",
  isAuthenticated,
  isAuthorized("Admin", "Doctor"),
  createMedicalRecord
);

// Patient / Doctor / Admin: view a patient's records
router.get(
  "/patient/:patientId",
  isAuthenticated,
  getPatientMedicalRecords
);

// Single record
router.get("/:id", isAuthenticated, getMedicalRecordById);

// Doctor / Admin: update
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("Admin", "Doctor"),
  updateMedicalRecord
);

// Admin only: delete
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteMedicalRecord
);

export default router;
