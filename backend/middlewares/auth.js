import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

/**
 * Generic token authenticator — picks the right cookie based on role header or tries both.
 */
const authenticateFromCookie = async (req, cookieName) => {
  const token = req.cookies[cookieName];
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findById(decoded.id);
  return user || null;
};

/**
 * ================================
 * ADMIN AUTHENTICATION (DASHBOARD)
 * ================================
 */
export const isAdminAuthenticated = catchAsyncErrors(async (req, _res, next) => {
  const token = req.cookies.adminToken;
  if (!token) {
    return next(new ErrorHandler("Dashboard User is not authenticated!", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found!", 404));
  }
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403));
  }
  next();
});

/**
 * ================================
 * PATIENT AUTHENTICATION (FRONTEND)
 * ================================
 */
export const isPatientAuthenticated = catchAsyncErrors(async (req, _res, next) => {
  const token = req.cookies.patientToken;
  if (!token) {
    return next(new ErrorHandler("User is not authenticated!", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found!", 404));
  }
  if (req.user.role !== "Patient") {
    return next(new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403));
  }
  next();
});

/**
 * ================================
 * DOCTOR AUTHENTICATION
 * ================================
 */
export const isDoctorAuthenticated = catchAsyncErrors(async (req, _res, next) => {
  const token = req.cookies.doctorToken;
  if (!token) {
    return next(new ErrorHandler("Doctor is not authenticated!", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found!", 404));
  }
  if (req.user.role !== "Doctor") {
    return next(new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403));
  }
  next();
});

/**
 * ================================
 * MULTI-ROLE AUTHENTICATION
 * Tries adminToken, doctorToken, then patientToken.
 * Useful for shared resources (e.g., notifications, medical records).
 * ================================
 */
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token =
    req.cookies.adminToken ||
    req.cookies.doctorToken ||
    req.cookies.patientToken;

  if (!token) {
    return next(new ErrorHandler("Not authenticated!", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);

  if (!req.user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  next();
});

/**
 * ================================
 * ROLE BASED AUTHORIZATION (GENERIC)
 * Example: router.get("/route", isAuthenticated, isAuthorized("Admin", "Doctor"))
 * ================================
 */
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user?.role || "User"} not allowed to access this resource!`,
          403
        )
      );
    }
    next();
  };
};
