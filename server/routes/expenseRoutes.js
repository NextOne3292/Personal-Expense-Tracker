import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById
} from "../controllers/expenseController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE Expense
router.post("/", protect, createExpense);

// GET all expenses for logged-in user
router.get("/", protect, getExpenses);

// GET single expense by ID
router.get("/:id", protect, getExpenseById);

// UPDATE expense
router.put("/:id", protect, updateExpenseById);

// DELETE expense
router.delete("/:id", protect, deleteExpenseById);

export default router;
