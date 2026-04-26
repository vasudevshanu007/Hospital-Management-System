import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true },
    genericName: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["Tablet", "Syrup", "Injection", "Capsule", "Cream", "Drops", "Other"],
    },
    manufacturer: { type: String },
    unit: { type: String, default: "units" },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    minStockLevel: { type: Number, default: 10 },
    unitPrice: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
    batchNumber: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: is low stock
inventorySchema.virtual("isLowStock").get(function () {
  return this.stockQuantity <= this.minStockLevel;
});

inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.set("toObject", { virtuals: true });

export const Inventory = mongoose.model("Inventory", inventorySchema);
