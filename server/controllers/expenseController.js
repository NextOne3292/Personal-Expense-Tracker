import Expense from "../models/expenseModel.js";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

/* ---------- Helpers ---------- */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const idString = (val) => (val && val._id ? String(val._id) : String(val));

/* CREATE EXPENSE */
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date = Date.now(), note = "" } = req.body;

    if (!title || !amount || !category) return res.status(400).json({ message: "All fields required" });
    if (!isValidObjectId(category)) return res.status(400).json({ message: "Invalid category id" });

    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ message: "Category not found" });

    // ensure category belongs to user or is default
    if (cat.user && String(cat.user) !== String(req.user._id)) {
      return res.status(400).json({ message: "Category does not belong to user" });
    }

    // enforce expense category type
    if (cat.type !== "expense") {
      return res.status(400).json({ message: "Category type mismatch: choose an expense category" });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount,
      category,
      user: req.user._id,
      date,
      note: note.trim()
    });

    const populated = await Expense.findById(expense._id)
      .populate("category", "title icon color type")
      .populate("user", "name email");

    return res.status(201).json(populated);
  } catch (err) {
    console.error("createExpense error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* GET ALL EXPENSES FOR USER */
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id })
      .populate("category", "title icon color type")
      .sort({ date: -1 })
      .lean();
    return res.status(200).json(expenses);
  } catch (err) {
    console.error("getExpenses error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* GET EXPENSE BY ID */
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const expense = await Expense.findById(id)
      .populate("category", "title icon color type")
      .populate("user", "name email");

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (idString(expense.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(expense);
  } catch (err) {
    console.error("getExpenseById error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* UPDATE EXPENSE */
export const updateExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (String(expense.user) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

    // If category changed -> validate and ensure expense category type
    if (req.body.category) {
      if (!isValidObjectId(req.body.category)) return res.status(400).json({ message: "Invalid category id" });

      const cat = await Category.findById(req.body.category);
      if (!cat) return res.status(400).json({ message: "Category not found" });

      if (cat.user && String(cat.user) !== String(req.user._id)) {
        return res.status(400).json({ message: "Category does not belong to user" });
      }

      if (cat.type !== "expense") {
        return res.status(400).json({ message: "Category type mismatch: choose an expense category" });
      }
    }

    const updateData = { ...req.body };
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.note) updateData.note = updateData.note.trim();

    const updated = await Expense.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("category", "title icon color type")
      .populate("user", "name email");

    return res.status(200).json(updated);
  } catch (err) {
    console.error("updateExpenseById error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* DELETE EXPENSE */
export const deleteExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (String(expense.user) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

    await Expense.findByIdAndDelete(id);
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("deleteExpenseById error:", err);
    return res.status(500).json({ message: err.message });
  }
};
