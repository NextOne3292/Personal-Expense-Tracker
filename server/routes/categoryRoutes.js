import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById
} from "../controllers/categoryController.js";

import { protect } from "../middlewares/authMiddleware.js";  // to check JWT

const router = express.Router();

// CREATE category
router.post("/", protect, createCategory);

// GET all categories (default + user categories)
router.get("/", protect, getCategories);

// GET single category
router.get("/:id", protect, getCategoryById);

// UPDATE category
router.put("/:id", protect, updateCategoryById);

// DELETE category
router.delete("/:id", protect, deleteCategoryById);

export default router;
