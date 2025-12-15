import express from "express";
import {
  createIncome,
  getIncome,
  getIncomeById,
  updateIncomeById,
  deleteIncomeById
} from "../controllers/incomeController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE income
router.post("/", protect, createIncome);

// GET all income for logged-in user
router.get("/", protect, getIncome);

// GET single income by ID
router.get("/:id", protect, getIncomeById);

// UPDATE income
router.put("/:id", protect, updateIncomeById);

// DELETE income
router.delete("/:id", protect, deleteIncomeById);

export default router;
