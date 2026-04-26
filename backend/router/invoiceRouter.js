import express from "express";
import {
  createInvoice,
  getPatientInvoices,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  downloadInvoicePDF,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controller/invoiceController.js";
import {
  isAuthenticated,
  isAuthorized,
  isAdminAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// Admin: all invoices
router.get("/all", isAdminAuthenticated, getAllInvoices);

// Admin: create invoice
router.post(
  "/create",
  isAdminAuthenticated,
  createInvoice
);

// Patient: own invoices
router.get(
  "/patient/:patientId",
  isAuthenticated,
  getPatientInvoices
);

// Single invoice
router.get("/:id", isAuthenticated, getInvoiceById);

// Admin: update invoice
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateInvoice
);

// Download PDF
router.get("/:id/pdf", isAuthenticated, downloadInvoicePDF);

// Razorpay payment
router.post("/:id/razorpay/order", isAuthenticated, createRazorpayOrder);
router.post("/razorpay/verify", isAuthenticated, verifyRazorpayPayment);

export default router;
