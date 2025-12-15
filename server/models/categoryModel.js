import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: "" },
    type: { type: String, enum: ["income", "expense"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDefault: { type: Boolean, default: false },
    color: { type: String, default: "" }
  },
  { timestamps: true }
);

// speed queries
categorySchema.index({ user: 1, isDefault: 1 });

// prevent duplicate (title + type) per user (only when user != null)
categorySchema.index(
  { user: 1, title: 1, type: 1 },
  { unique: true, partialFilterExpression: { user: { $exists: true, $ne: null } } }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
