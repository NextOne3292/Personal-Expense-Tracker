import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

/* CREATE */
export const createCategory = async (req, res) => {
  try {
    const { title, type, icon = "", color = "" } = req.body;
    if (!title || !type) return res.status(400).json({ message: "Title and type required" });

    const normalizedTitle = title.trim();
    const existing = await Category.findOne({
      title: normalizedTitle,
      type,
      user: req.user ? req.user._id : null
    });
    if (existing) return res.status(409).json({ message: "Category already exists" });

    const category = await Category.create({
      title: normalizedTitle,
      type,
      icon,
      color,
      user: req.user._id,
      isDefault: false
    });
    return res.status(201).json(category);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Category already exists" });
    return res.status(500).json({ message: err.message });
  }
};

/* GET ALL (defaults + user) */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ user: null }, { user: req.user._id }]
    }).populate("user", "name email").sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* GET ONE */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
    const cat = await Category.findById(id).populate("user", "name email");
    if (!cat) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json(cat);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
export const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });

    const update = { ...req.body };
    if (update.title) update.title = update.title.trim();

    const updated = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json(updated);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Category already exists" });
    return res.status(500).json({ message: err.message });
  }
};

/* DELETE */
export const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
