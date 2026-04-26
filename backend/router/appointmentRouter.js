import express from "express";

import {
  postAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  exportAppointments,
  getDoctorAppointments,
  getMyAppointments,
  sendAppointmentConfirmation,
} from "../controller/appointmentController.js";

import {
  isAdminAuthenticated,
  isPatientAuthenticated,
  isDoctorAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// ================= PATIENT =================
router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/mine", isPatientAuthenticated, getMyAppointments);

// ================= DOCTOR =================
router.get("/doctor/mine", isDoctorAuthenticated, getDoctorAppointments);

// ================= ADMIN =================
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);
router.post("/confirm/:id", isAdminAuthenticated, sendAppointmentConfirmation);

// ================= EXPORT =================
router.get("/export-appointments", isAdminAuthenticated, exportAppointments);

export default router;
