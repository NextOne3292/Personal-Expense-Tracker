import Income from "../models/incomeModel.js";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

/* ---------- Helpers ---------- */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const idString = (val) => (val && val._id ? String(val._id) : String(val));

/* CREATE INCOME */
export const createIncome = async (req, res) => {
  try {
    const { title, amount, category, date = Date.now(), note = "" } = req.body;
    if (!title || !amount || !category) return res.status(400).json({ message: "All fields required" });

    if (!isValidObjectId(category)) return res.status(400).json({ message: "Invalid category id" });

    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ message: "Category not found" });

    // enforce correct category type
    if (cat.type !== "income") {
      return res.status(400).json({ message: "Category type mismatch: choose an income category" });
    }

    // allow default categories (user == null) or user-owned categories
    if (cat.user && String(cat.user) !== String(req.user._id)) {
      return res.status(400).json({ message: "Category does not belong to user" });
    }

    const income = await Income.create({
      title: title.trim(),
      amount,
      category,
      user: req.user._id,
      date,
      note: note.trim()
    });

    const populated = await Income.findById(income._id)
      .populate({ path: "category", select: "title icon color type" })
      .populate({ path: "user", select: "name email" });

    return res.status(201).json(populated);
  } catch (err) {
    console.error("createIncome error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* GET ALL INCOMES FOR USER */
export const getIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id })
      .populate({ path: "category", select: "title icon color type" })
      .sort({ date: -1 })
      .lean();
    return res.status(200).json(incomes);
  } catch (err) {
    console.error("getIncome error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* GET INCOME BY ID */
export const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const income = await Income.findById(id)
      .populate({ path: "category", select: "title icon color type" })
      .populate({ path: "user", select: "name email" });

    if (!income) return res.status(404).json({ message: "Income not found" });

    // robust ownership check: handle populated or raw ObjectId
    if (idString(income.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(income);
  } catch (err) {
    console.error("getIncomeById error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* UPDATE INCOME BY ID */
export const updateIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const income = await Income.findById(id);
    if (!income) return res.status(404).json({ message: "Income not found" });

    if (String(income.user) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

    // If category is provided -> validate and ensure it's income type and allowed
    if (req.body.category) {
      if (!isValidObjectId(req.body.category)) return res.status(400).json({ message: "Invalid category id" });

      const cat = await Category.findById(req.body.category);
      if (!cat) return res.status(400).json({ message: "Category not found" });

      if (cat.user && String(cat.user) !== String(req.user._id)) {
        return res.status(400).json({ message: "Category does not belong to user" });
      }

      if (cat.type !== "income") {
        return res.status(400).json({ message: "Category type mismatch: choose an income category" });
      }
    }

    const updateData = { ...req.body };
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.note) updateData.note = updateData.note.trim();

    const updated = await Income.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate({ path: "category", select: "title icon color type" })
      .populate({ path: "user", select: "name email" });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("updateIncomeById error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* DELETE INCOME BY ID */
export const deleteIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const income = await Income.findById(id);
    if (!income) return res.status(404).json({ message: "Income not found" });

    if (String(income.user) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden: cannot delete this income" });

    await Income.findByIdAndDelete(id);
    return res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    console.error("deleteIncomeById error:", err);
    return res.status(500).json({ message: err.message });
  }
};
