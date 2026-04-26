import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
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
    recordType: {
      type: String,
      enum: ["Diagnosis", "Allergy", "Vitals", "Notes", "General"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    diagnosis: { type: String },
    allergies: [{ type: String }],
    vitals: {
      bloodPressure: { type: String },
      heartRate: { type: String },
      temperature: { type: String },
      weight: { type: String },
      height: { type: String },
      oxygenSaturation: { type: String },
    },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
