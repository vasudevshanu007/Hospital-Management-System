import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { LabReport } from "../models/labReportSchema.js";
import { createAuditLog } from "../middlewares/auditLog.js";
import cloudinary from "cloudinary";

/* =========================
   UPLOAD LAB REPORT (Admin/Doctor)
========================= */
export const uploadLabReport = catchAsyncErrors(async (req, res, next) => {
  const { patientId, reportType, reportName, results, notes, appointmentId } = req.body;

  if (!patientId || !reportType || !reportName) {
    return next(new ErrorHandler("patientId, reportType and reportName are required!", 400));
  }

  let reportFile = {};

  if (req.files && req.files.reportFile) {
    const file = req.files.reportFile;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

    if (!allowedFormats.includes(file.mimetype)) {
      return next(new ErrorHandler("File format not supported! Use PNG, JPG, WEBP or PDF.", 400));
    }

    const cloudResponse = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "lab_reports",
      resource_type: "auto",
    });

    reportFile = { public_id: cloudResponse.public_id, url: cloudResponse.secure_url };
  }

  const report = await LabReport.create({
    patientId,
    doctorId: req.user.role === "Doctor" ? req.user._id : undefined,
    appointmentId,
    reportType,
    reportName,
    reportFile,
    results,
    notes,
    status: results ? "Completed" : "Pending",
  });

  await createAuditLog(req, "CREATE", "LabReport", report._id, `Lab report uploaded for patient ${patientId}`);

  res.status(201).json({ success: true, message: "Lab report uploaded!", report });
});

/* =========================
   GET PATIENT'S LAB REPORTS
========================= */
export const getPatientLabReports = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params;

  if (req.user.role === "Patient" && req.user._id.toString() !== patientId) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  const reports = await LabReport.find({ patientId })
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ date: -1 });

  res.status(200).json({ success: true, count: reports.length, reports });
});

/* =========================
   GET SINGLE LAB REPORT
========================= */
export const getLabReportById = catchAsyncErrors(async (req, res, next) => {
  const report = await LabReport.findById(req.params.id)
    .populate("doctorId", "firstName lastName doctorDepartment")
    .populate("patientId", "firstName lastName email");

  if (!report) return next(new ErrorHandler("Lab report not found!", 404));

  if (req.user.role === "Patient" && report.patientId._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  res.status(200).json({ success: true, report });
});

/* =========================
   UPDATE LAB REPORT (Doctor/Admin)
========================= */
export const updateLabReport = catchAsyncErrors(async (req, res, next) => {
  const report = await LabReport.findById(req.params.id);
  if (!report) return next(new ErrorHandler("Lab report not found!", 404));

  const { results, notes, status } = req.body;

  if (results !== undefined) report.results = results;
  if (notes !== undefined) report.notes = notes;
  if (status) report.status = status;

  await report.save();
  await createAuditLog(req, "UPDATE", "LabReport", report._id, "Lab report updated");

  res.status(200).json({ success: true, message: "Lab report updated!", report });
});

/* =========================
   DELETE LAB REPORT (Admin)
========================= */
export const deleteLabReport = catchAsyncErrors(async (req, res, next) => {
  const report = await LabReport.findById(req.params.id);
  if (!report) return next(new ErrorHandler("Lab report not found!", 404));

  if (report.reportFile?.public_id) {
    await cloudinary.v2.uploader.destroy(report.reportFile.public_id);
  }

  await report.deleteOne();
  await createAuditLog(req, "DELETE", "LabReport", req.params.id, "Lab report deleted");

  res.status(200).json({ success: true, message: "Lab report deleted!" });
});

/* =========================
   GET ALL LAB REPORTS (Admin)
========================= */
export const getAllLabReports = catchAsyncErrors(async (req, res) => {
  const reports = await LabReport.find()
    .populate("patientId", "firstName lastName email")
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reports.length, reports });
});
