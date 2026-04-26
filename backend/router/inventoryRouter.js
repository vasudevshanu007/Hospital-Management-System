import express from "express";
import {
  addMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  restockMedicine,
  deleteMedicine,
  getLowStockAlerts,
} from "../controller/inventoryController.js";
import {
  isAuthenticated,
  isAuthorized,
  isAdminAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// Admin: add medicine
router.post("/add", isAdminAuthenticated, addMedicine);

// Admin / Doctor: view all (supports ?lowStock=true&category=Tablet)
router.get(
  "/",
  isAuthenticated,
  isAuthorized("Admin", "Doctor"),
  getAllMedicines
);

// Low stock alerts
router.get(
  "/low-stock",
  isAuthenticated,
  isAuthorized("Admin", "Doctor"),
  getLowStockAlerts
);

// Single medicine
router.get(
  "/:id",
  isAuthenticated,
  isAuthorized("Admin", "Doctor"),
  getMedicineById
);

// Admin: update
router.put("/:id", isAdminAuthenticated, updateMedicine);

// Admin: restock
router.patch("/:id/restock", isAdminAuthenticated, restockMedicine);

// Admin: deactivate
router.delete("/:id", isAdminAuthenticated, deleteMedicine);

export default router;
