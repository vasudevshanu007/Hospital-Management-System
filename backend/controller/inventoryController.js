import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Inventory } from "../models/inventorySchema.js";
import { createAuditLog } from "../middlewares/auditLog.js";

/* =========================
   ADD MEDICINE (Admin)
========================= */
export const addMedicine = catchAsyncErrors(async (req, res, next) => {
  const {
    medicineName, genericName, category, manufacturer,
    unit, stockQuantity, minStockLevel, unitPrice,
    expiryDate, batchNumber, description,
  } = req.body;

  if (!medicineName || !category || stockQuantity === undefined || !unitPrice) {
    return next(new ErrorHandler("medicineName, category, stockQuantity and unitPrice are required!", 400));
  }

  const medicine = await Inventory.create({
    medicineName, genericName, category, manufacturer,
    unit, stockQuantity, minStockLevel, unitPrice,
    expiryDate, batchNumber, description,
  });

  await createAuditLog(req, "CREATE", "Inventory", medicine._id, `Added medicine: ${medicineName}`);

  res.status(201).json({ success: true, message: "Medicine added to inventory!", medicine });
});

/* =========================
   GET ALL MEDICINES (Admin/Doctor)
========================= */
export const getAllMedicines = catchAsyncErrors(async (req, res) => {
  const { lowStock, category } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;

  const medicines = await Inventory.find(filter).sort({ medicineName: 1 });

  const result = medicines.map((m) => m.toJSON());

  const response = lowStock === "true"
    ? result.filter((m) => m.isLowStock)
    : result;

  res.status(200).json({ success: true, count: response.length, medicines: response });
});

/* =========================
   GET SINGLE MEDICINE
========================= */
export const getMedicineById = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Inventory.findById(req.params.id);
  if (!medicine) return next(new ErrorHandler("Medicine not found!", 404));
  res.status(200).json({ success: true, medicine });
});

/* =========================
   UPDATE MEDICINE STOCK (Admin)
========================= */
export const updateMedicine = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Inventory.findById(req.params.id);
  if (!medicine) return next(new ErrorHandler("Medicine not found!", 404));

  const {
    medicineName, genericName, category, manufacturer, unit,
    stockQuantity, minStockLevel, unitPrice, expiryDate, batchNumber, description, isActive,
  } = req.body;

  if (medicineName !== undefined) medicine.medicineName = medicineName;
  if (genericName !== undefined) medicine.genericName = genericName;
  if (category !== undefined) medicine.category = category;
  if (manufacturer !== undefined) medicine.manufacturer = manufacturer;
  if (unit !== undefined) medicine.unit = unit;
  if (stockQuantity !== undefined) medicine.stockQuantity = stockQuantity;
  if (minStockLevel !== undefined) medicine.minStockLevel = minStockLevel;
  if (unitPrice !== undefined) medicine.unitPrice = unitPrice;
  if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
  if (batchNumber !== undefined) medicine.batchNumber = batchNumber;
  if (description !== undefined) medicine.description = description;
  if (isActive !== undefined) medicine.isActive = isActive;

  await medicine.save();
  await createAuditLog(req, "UPDATE", "Inventory", medicine._id, `Updated medicine: ${medicine.medicineName}`);

  res.status(200).json({ success: true, message: "Medicine updated!", medicine });
});

/* =========================
   RESTOCK MEDICINE (Admin)
========================= */
export const restockMedicine = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Inventory.findById(req.params.id);
  if (!medicine) return next(new ErrorHandler("Medicine not found!", 404));

  const { quantity } = req.body;
  if (!quantity || quantity <= 0) {
    return next(new ErrorHandler("Valid quantity required!", 400));
  }

  medicine.stockQuantity += Number(quantity);
  await medicine.save();

  await createAuditLog(req, "RESTOCK", "Inventory", medicine._id, `Restocked ${medicine.medicineName} by ${quantity} units`);

  res.status(200).json({
    success: true,
    message: `Restocked ${quantity} units of ${medicine.medicineName}`,
    medicine,
  });
});

/* =========================
   DELETE MEDICINE (Admin — soft delete)
========================= */
export const deleteMedicine = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Inventory.findById(req.params.id);
  if (!medicine) return next(new ErrorHandler("Medicine not found!", 404));

  medicine.isActive = false;
  await medicine.save();

  await createAuditLog(req, "DELETE", "Inventory", medicine._id, `Deactivated medicine: ${medicine.medicineName}`);

  res.status(200).json({ success: true, message: "Medicine removed from active inventory!" });
});

/* =========================
   GET LOW STOCK ALERT SUMMARY
========================= */
export const getLowStockAlerts = catchAsyncErrors(async (req, res) => {
  const allMeds = await Inventory.find({ isActive: true });
  const lowStock = allMeds.filter((m) => m.stockQuantity <= m.minStockLevel);

  res.status(200).json({
    success: true,
    count: lowStock.length,
    medicines: lowStock.map((m) => m.toJSON()),
  });
});
