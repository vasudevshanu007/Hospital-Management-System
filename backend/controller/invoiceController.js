import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Invoice } from "../models/invoiceSchema.js";
import { User } from "../models/userSchema.js";
import { createAuditLog } from "../middlewares/auditLog.js";
import { sendEmail, invoiceEmail } from "../utils/email.js";
import { generateInvoicePDF } from "../utils/pdfGenerator.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/* =========================
   CREATE INVOICE (Admin)
========================= */
export const createInvoice = catchAsyncErrors(async (req, res, next) => {
  const { patientId, appointmentId, services, tax, discount, notes, dueDate } = req.body;

  if (!patientId || !services || services.length === 0) {
    return next(new ErrorHandler("patientId and services are required!", 400));
  }

  const patient = await User.findById(patientId);
  if (!patient) return next(new ErrorHandler("Patient not found!", 404));

  const processedServices = services.map((s) => ({
    ...s,
    total: s.quantity * s.unitPrice,
  }));

  const subtotal = processedServices.reduce((sum, s) => sum + s.total, 0);
  const taxAmount = tax || 0;
  const discountAmount = discount || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  const invoice = await Invoice.create({
    patientId,
    appointmentId,
    services: processedServices,
    subtotal,
    tax: taxAmount,
    discount: discountAmount,
    totalAmount,
    notes,
    dueDate,
  });

  // Email notification
  await sendEmail(
    patient.email,
    `Invoice ${invoice.invoiceNumber} - HealthCare Hospital`,
    invoiceEmail(
      `${patient.firstName} ${patient.lastName}`,
      invoice.invoiceNumber,
      totalAmount,
      dueDate ? new Date(dueDate).toLocaleDateString() : null
    )
  );

  await createAuditLog(req, "CREATE", "Invoice", invoice._id, `Invoice ${invoice.invoiceNumber} for patient ${patientId}`);

  res.status(201).json({ success: true, message: "Invoice created!", invoice });
});

/* =========================
   GET PATIENT INVOICES
========================= */
export const getPatientInvoices = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params;

  if (req.user.role === "Patient" && req.user._id.toString() !== patientId) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  const invoices = await Invoice.find({ patientId })
    .populate("appointmentId", "appointment_date department doctor")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: invoices.length, invoices });
});

/* =========================
   GET ALL INVOICES (Admin)
========================= */
export const getAllInvoices = catchAsyncErrors(async (req, res) => {
  const invoices = await Invoice.find()
    .populate("patientId", "firstName lastName email phone")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: invoices.length, invoices });
});

/* =========================
   GET SINGLE INVOICE
========================= */
export const getInvoiceById = catchAsyncErrors(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("patientId", "firstName lastName email phone")
    .populate("appointmentId", "appointment_date department doctor");

  if (!invoice) return next(new ErrorHandler("Invoice not found!", 404));

  if (req.user.role === "Patient" && invoice.patientId._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  res.status(200).json({ success: true, invoice });
});

/* =========================
   UPDATE INVOICE (Admin)
========================= */
export const updateInvoice = catchAsyncErrors(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return next(new ErrorHandler("Invoice not found!", 404));

  const { status, paidAmount, paymentMethod } = req.body;

  if (status) invoice.status = status;
  if (paidAmount !== undefined) {
    invoice.paidAmount = paidAmount;
    if (paidAmount >= invoice.totalAmount) {
      invoice.status = "Paid";
      invoice.paymentDate = new Date();
    } else if (paidAmount > 0) {
      invoice.status = "Partial";
    }
  }
  if (paymentMethod) invoice.paymentMethod = paymentMethod;

  await invoice.save();
  await createAuditLog(req, "UPDATE", "Invoice", invoice._id, `Invoice ${invoice.invoiceNumber} updated`);

  res.status(200).json({ success: true, message: "Invoice updated!", invoice });
});

/* =========================
   DOWNLOAD INVOICE PDF
========================= */
export const downloadInvoicePDF = catchAsyncErrors(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("patientId", "firstName lastName email phone");

  if (!invoice) return next(new ErrorHandler("Invoice not found!", 404));

  if (req.user.role === "Patient" && invoice.patientId._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Access denied!", 403));
  }

  generateInvoicePDF(res, invoice, invoice.patientId);
});

/* =========================
   CREATE RAZORPAY ORDER
========================= */
export const createRazorpayOrder = catchAsyncErrors(async (req, res, next) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return next(new ErrorHandler("Payment gateway not configured!", 503));
  }

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return next(new ErrorHandler("Invoice not found!", 404));

  if (invoice.status === "Paid") {
    return next(new ErrorHandler("Invoice is already paid!", 400));
  }

  const amountDue = invoice.totalAmount - (invoice.paidAmount || 0);

  const order = await razorpay.orders.create({
    amount: Math.round(amountDue * 100), // paise
    currency: "INR",
    receipt: `inv_${invoice._id}`,
    notes: { invoiceNumber: invoice.invoiceNumber },
  });

  invoice.razorpayOrderId = order.id;
  await invoice.save();

  res.status(200).json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

/* =========================
   VERIFY RAZORPAY PAYMENT
========================= */
export const verifyRazorpayPayment = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new ErrorHandler("Payment details incomplete!", 400));
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return next(new ErrorHandler("Payment verification failed!", 400));
  }

  const invoice = await Invoice.findOne({ razorpayOrderId: razorpay_order_id });
  if (!invoice) return next(new ErrorHandler("Invoice not found!", 404));

  invoice.razorpayPaymentId = razorpay_payment_id;
  invoice.paidAmount = invoice.totalAmount;
  invoice.status = "Paid";
  invoice.paymentDate = new Date();
  invoice.paymentMethod = "Razorpay";
  await invoice.save();

  await createAuditLog(req, "PAYMENT", "Invoice", invoice._id, `Payment verified for invoice ${invoice.invoiceNumber}`);

  res.status(200).json({ success: true, message: "Payment verified successfully!", invoice });
});
