import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { MedicalRecord } from "../models/medicalRecordSchema.js";
import { createAuditLog } from "../middlewares/auditLog.js";

/* =========================
   CREATE MEDICAL RECORD
   (Doctor / Admin only)
========================= */
export const createMedicalRecord = catchAsyncErrors(async (req, res, next) => {
  const { patientId, recordType, title, description, diagnosis, allergies, vitals, notes, appointmentId } = req.body;

  if (!patientId || !recordType || !title) {
    return next(new ErrorHandler("patientId, recordType and title are required!", 400));
  }

  const record = await MedicalRecord.create({
    patientId,
    doctorId: req.user.role === "Doctor" ? req.user._id : undefined,
    appointmentId,
    recordType,
    title,
    description,
    diagnosis,
    allergies: allergies || [],
    vitals: vitals || {},
    notes,
  });

  await createAuditLog(req, "CREATE", "MedicalRecord", record._id, `Created ${recordType} record for patient ${patientId}`);

  res.status(201).json({ success: true, message: "Medical record created!", record });
});

/* =========================
   GET PATIENT'S FULL RECORDS
   (Patient sees own, Doctor/Admin see any)
========================= */
export const getPatientMedicalRecords = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params;

  // Patients can only see their own records
  if (req.user.role === "Patient" && req.user._id.toString() !== patientId) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  const records = await MedicalRecord.find({ patientId })
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ date: -1 });

  res.status(200).json({ success: true, count: records.length, records });
});

/* =========================
   GET SINGLE RECORD
========================= */
export const getMedicalRecordById = catchAsyncErrors(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate("doctorId", "firstName lastName doctorDepartment")
    .populate("patientId", "firstName lastName email");

  if (!record) return next(new ErrorHandler("Medical record not found!", 404));

  // Patient can only view their own records
  if (req.user.role === "Patient" && record.patientId._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  res.status(200).json({ success: true, record });
});

/* =========================
   UPDATE MEDICAL RECORD
   (Doctor / Admin only)
========================= */
export const updateMedicalRecord = catchAsyncErrors(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) return next(new ErrorHandler("Medical record not found!", 404));

  const { title, description, diagnosis, allergies, vitals, notes, recordType } = req.body;

  if (title) record.title = title;
  if (description) record.description = description;
  if (diagnosis) record.diagnosis = diagnosis;
  if (allergies) record.allergies = allergies;
  if (vitals) record.vitals = { ...record.vitals.toObject?.() ?? record.vitals, ...vitals };
  if (notes) record.notes = notes;
  if (recordType) record.recordType = recordType;

  await record.save();
  await createAuditLog(req, "UPDATE", "MedicalRecord", record._id, "Updated medical record");

  res.status(200).json({ success: true, message: "Medical record updated!", record });
});

/* =========================
   DELETE MEDICAL RECORD (Admin only)
========================= */
export const deleteMedicalRecord = catchAsyncErrors(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) return next(new ErrorHandler("Medical record not found!", 404));

  await record.deleteOne();
  await createAuditLog(req, "DELETE", "MedicalRecord", req.params.id, "Deleted medical record");

  res.status(200).json({ success: true, message: "Medical record deleted!" });
});

/* =========================
   GET ALL RECORDS (Admin)
========================= */
export const getAllMedicalRecords = catchAsyncErrors(async (req, res) => {
  const records = await MedicalRecord.find()
    .populate("patientId", "firstName lastName email")
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: records.length, records });
});
