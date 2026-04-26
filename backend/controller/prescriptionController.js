import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Prescription } from "../models/prescriptionSchema.js";
import { User } from "../models/userSchema.js";
import { createAuditLog } from "../middlewares/auditLog.js";
import { sendEmail, prescriptionEmail } from "../utils/email.js";
import { generatePrescriptionPDF } from "../utils/pdfGenerator.js";

/* =========================
   CREATE PRESCRIPTION (Doctor)
========================= */
export const createPrescription = catchAsyncErrors(async (req, res, next) => {
  const { patientId, appointmentId, medicines, diagnosis, notes, followUpDate } = req.body;

  if (!patientId || !medicines || medicines.length === 0) {
    return next(new ErrorHandler("patientId and at least one medicine are required!", 400));
  }

  const patient = await User.findById(patientId);
  if (!patient || patient.role !== "Patient") {
    return next(new ErrorHandler("Patient not found!", 404));
  }

  const prescription = await Prescription.create({
    patientId,
    doctorId: req.user._id,
    appointmentId,
    medicines,
    diagnosis,
    notes,
    followUpDate,
  });

  // Send email notification
  const doctorName = `${req.user.firstName} ${req.user.lastName}`;
  await sendEmail(
    patient.email,
    "New Prescription from HealthCare Hospital",
    prescriptionEmail(`${patient.firstName} ${patient.lastName}`, doctorName, medicines)
  );

  await createAuditLog(req, "CREATE", "Prescription", prescription._id, `Prescription for patient ${patientId}`);

  res.status(201).json({ success: true, message: "Prescription created!", prescription });
});

/* =========================
   GET PATIENT'S PRESCRIPTIONS
========================= */
export const getPatientPrescriptions = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params;

  if (req.user.role === "Patient" && req.user._id.toString() !== patientId) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  const prescriptions = await Prescription.find({ patientId })
    .populate("doctorId", "firstName lastName doctorDepartment docAvatar")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: prescriptions.length, prescriptions });
});

/* =========================
   GET DOCTOR'S PRESCRIPTIONS (Doctor sees what they wrote)
========================= */
export const getDoctorPrescriptions = catchAsyncErrors(async (req, res) => {
  const prescriptions = await Prescription.find({ doctorId: req.user._id })
    .populate("patientId", "firstName lastName email phone")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: prescriptions.length, prescriptions });
});

/* =========================
   GET SINGLE PRESCRIPTION
========================= */
export const getPrescriptionById = catchAsyncErrors(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate("doctorId", "firstName lastName doctorDepartment")
    .populate("patientId", "firstName lastName email phone dob gender");

  if (!prescription) return next(new ErrorHandler("Prescription not found!", 404));

  if (
    req.user.role === "Patient" &&
    prescription.patientId._id.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  res.status(200).json({ success: true, prescription });
});

/* =========================
   DOWNLOAD PRESCRIPTION AS PDF
========================= */
export const downloadPrescriptionPDF = catchAsyncErrors(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate("doctorId", "firstName lastName doctorDepartment")
    .populate("patientId", "firstName lastName email phone dob gender");

  if (!prescription) return next(new ErrorHandler("Prescription not found!", 404));

  if (
    req.user.role === "Patient" &&
    prescription.patientId._id.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  generatePrescriptionPDF(res, prescription, prescription.patientId, prescription.doctorId);
});

/* =========================
   UPDATE PRESCRIPTION STATUS (Doctor)
========================= */
export const updatePrescriptionStatus = catchAsyncErrors(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) return next(new ErrorHandler("Prescription not found!", 404));

  if (prescription.doctorId.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("Access denied!", 403));
  }

  const { status } = req.body;
  if (!["Active", "Completed", "Cancelled"].includes(status)) {
    return next(new ErrorHandler("Invalid status!", 400));
  }

  prescription.status = status;
  await prescription.save();

  res.status(200).json({ success: true, message: "Prescription updated!", prescription });
});

/* =========================
   GET ALL PRESCRIPTIONS (Admin)
========================= */
export const getAllPrescriptions = catchAsyncErrors(async (req, res) => {
  const prescriptions = await Prescription.find()
    .populate("patientId", "firstName lastName email")
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: prescriptions.length, prescriptions });
});
