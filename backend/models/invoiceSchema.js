import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number },
});

const invoiceSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    invoiceNumber: { type: String, unique: true },
    services: [serviceItemSchema],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Partial", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: { type: String },
    paymentDate: { type: Date },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    notes: { type: String },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate invoice number before save
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${(count + 1).toString().padStart(4, "0")}`;
  }

  // Calculate service totals
  if (this.services && this.services.length > 0) {
    this.services = this.services.map((s) => ({
      ...s.toObject ? s.toObject() : s,
      total: s.quantity * s.unitPrice,
    }));
    this.subtotal = this.services.reduce((sum, s) => sum + s.total, 0);
  }

  next();
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
