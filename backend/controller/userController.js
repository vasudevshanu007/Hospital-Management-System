import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import { Parser } from "json2csv";

/* =========================
   PATIENT REGISTER
========================= */
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Patient",
  });

  generateToken(user, "User Registered!", 200, res);
});

/* =========================
   LOGIN
========================= */
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;

  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password & Confirm Password Do Not Match!", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  if (role !== user.role) {
    return next(new ErrorHandler("User Not Found With This Role!", 400));
  }

  generateToken(user, "Login Successfully!", 201, res);
});

/* =========================
   ADD NEW ADMIN
========================= */
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  });
});

/* =========================
   ADD NEW DOCTOR
========================= */
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.docAvatar) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});

/* =========================
   GET ALL DOCTORS
========================= */
export const getAllDoctors = catchAsyncErrors(async (_req, res) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({ success: true, doctors });
});

/* =========================
   GET USER DETAILS
========================= */
export const getUserDetails = catchAsyncErrors(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

/* =========================
   LOGOUTS
========================= */
export const logoutAdmin = catchAsyncErrors(async (_req, res) => {
  res
    .cookie("adminToken", "", { httpOnly: true, expires: new Date(Date.now()) })
    .status(200)
    .json({ success: true, message: "Admin Logged Out Successfully." });
});

export const logoutPatient = catchAsyncErrors(async (_req, res) => {
  res
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .status(200)
    .json({ success: true, message: "Patient Logged Out Successfully." });
});

export const logoutDoctor = catchAsyncErrors(async (_req, res) => {
  res
    .cookie("doctorToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .status(200)
    .json({ success: true, message: "Doctor Logged Out Successfully." });
});

/* =========================
   EXPORT PATIENTS
========================= */
export const exportPatients = catchAsyncErrors(async (_req, res) => {
  const patients = await User.find({ role: "Patient" }).lean();

  const fields = ["firstName", "lastName", "email", "phone", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(patients);

  res.header("Content-Type", "text/csv");
  res.attachment("patients.csv");
  res.send(csv);
});

/* =========================
   EXPORT DOCTORS
========================= */
export const exportDoctors = catchAsyncErrors(async (_req, res) => {
  const doctors = await User.find({ role: "Doctor" }).lean();

  const fields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "doctorDepartment",
    "createdAt",
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(doctors);

  res.header("Content-Type", "text/csv");
  res.attachment("doctors.csv");
  res.send(csv);
});
