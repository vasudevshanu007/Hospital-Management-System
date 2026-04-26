import mongoose from "mongoose";

const labReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    reportType: { type: String, required: true },
    reportName: { type: String, required: true },
    reportFile: {
      public_id: { type: String },
      url: { type: String },
    },
    results: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Reviewed"],
      default: "Pending",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const LabReport = mongoose.model("LabReport", labReportSchema);
