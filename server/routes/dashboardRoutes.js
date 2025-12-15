// routes/dashboardRoutes.js
import express from "express";
import {
  getOverview,
  getDaily,
  getMonthly,
  getYearly,
  getCategoryBreakdown,
  getTransactions
} from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js"; // adjust path to your auth middleware

const router = express.Router();

// all routes are protected
router.use(protect);

// Overview totals + recent transactions
router.get("/overview", getOverview);

// Daily totals for a month or custom range
// Query: ?month=12&year=2025 OR ?startDate=2025-12-01&endDate=2025-12-31
router.get("/daily", getDaily);

// Monthly totals for a year: ?year=2025
router.get("/monthly", getMonthly);

// Yearly totals: ?startYear=2023&endYear=2025
router.get("/yearly", getYearly);

// Category breakdown: ?type=expense|income&startDate=&endDate=
router.get("/categories", getCategoryBreakdown);

// Transactions (combined): ?page=1&limit=20&type=expense|income
router.get("/transactions", getTransactions);

export default router;
