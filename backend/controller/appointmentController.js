import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { Parser } from "json2csv";
import { createAuditLog } from "../middlewares/auditLog.js";
import { sendEmail, appointmentConfirmationEmail } from "../utils/email.js";

/* =========================
   POST APPOINTMENT
========================= */
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctor_firstName ||
    !doctor_lastName ||
    !address
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Check doctor existence
  const isConflict = await User.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (isConflict.length === 0) {
    return next(new ErrorHandler("Doctor not found!", 404));
  }

  if (isConflict.length > 1) {
    return next(
      new ErrorHandler(
        "Doctors Conflict! Please Contact Through Email Or Phone!",
        400
      )
    );
  }

  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;

  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited,
    address,
    doctorId,
    patientId,
    status: "Pending",
  });

  res.status(200).json({
    success: true,
    message: "Appointment Sent Successfully!",
    appointment,
  });
});

/* =========================
   GET ALL APPOINTMENTS
========================= */
export const getAllAppointments = catchAsyncErrors(async (_req, res) => {
  const appointments = await Appointment.find();

  res.status(200).json({
    success: true,
    appointments,
  });
});

/* =========================
   UPDATE APPOINTMENT STATUS / VISITED
========================= */
export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    const { status, hasVisited } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }

    // ✅ Explicit updates (important for enum)
    if (status) {
      appointment.status = status;
    }

    if (hasVisited !== undefined) {
      appointment.hasVisited = hasVisited;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment Updated Successfully!",
      appointment,
    });
  }
);

/* =========================
   DELETE APPOINTMENT
========================= */
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Appointment Deleted Successfully!",
  });
});

/* =========================
   EXPORT APPOINTMENTS (CSV)
========================= */
export const exportAppointments = catchAsyncErrors(async (_req, res) => {
  const appointments = await Appointment.find().lean();

  const formattedData = appointments.map((item) => ({
    patientName: `${item.firstName} ${item.lastName}`,
    email: item.email,
    phone: item.phone,
    department: item.department,
    doctorName: `${item.doctor.firstName} ${item.doctor.lastName}`,
    appointmentDate: item.appointment_date,
    status: item.status,
    hasVisited: item.hasVisited ? "Yes" : "No",
  }));

  const fields = [
    "patientName",
    "email",
    "phone",
    "department",
    "doctorName",
    "appointmentDate",
    "status",
    "hasVisited",
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(formattedData);

  res.header("Content-Type", "text/csv");
  res.attachment("appointments.csv");
  res.send(csv);
});

/* =========================
   GET DOCTOR'S OWN APPOINTMENTS
========================= */
export const getDoctorAppointments = catchAsyncErrors(async (req, res) => {
  const appointments = await Appointment.find({ doctorId: req.user._id })
    .populate("patientId", "firstName lastName email phone dob gender")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: appointments.length, appointments });
});

/* =========================
   GET PATIENT'S OWN APPOINTMENTS
========================= */
export const getMyAppointments = catchAsyncErrors(async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.user._id })
    .populate("doctorId", "firstName lastName doctorDepartment docAvatar")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: appointments.length, appointments });
});

/* =========================
   SEND CONFIRMATION EMAIL AFTER ACCEPTANCE
========================= */
export const sendAppointmentConfirmation = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patientId", "firstName lastName email")
    .populate("doctorId", "firstName lastName");

  if (!appointment) return next(new ErrorHandler("Appointment not found!", 404));

  if (appointment.patientId?.email) {
    await sendEmail(
      appointment.patientId.email,
      "Appointment Confirmed — HealthCare Hospital",
      appointmentConfirmationEmail(
        `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
        `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        appointment.appointment_date,
        appointment.department
      )
    );
  }

  res.status(200).json({ success: true, message: "Confirmation email sent!" });
});
