import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  login,
  logoutAdmin,
  logoutPatient,
  logoutDoctor,
  patientRegister,
  exportPatients,
  exportDoctors,
} from "../controller/userController.js";

import {
  isAdminAuthenticated,
  isPatientAuthenticated,
  isDoctorAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// ================= AUTH =================
router.post("/patient/register", patientRegister);
router.post("/login", login);

// ================= ADMIN =================
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

// ================= DOCTOR =================
router.get("/doctor/me", isDoctorAuthenticated, getUserDetails);
router.get("/doctor/logout", isDoctorAuthenticated, logoutDoctor);

// ================= PATIENT =================
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);

// ================= PUBLIC =================
router.get("/doctors", getAllDoctors);

// ================= EXPORT =================
router.get("/export-patients", isAdminAuthenticated, exportPatients);
router.get("/export-doctors", isAdminAuthenticated, exportDoctors);

export default router;
