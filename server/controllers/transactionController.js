import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";

export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, date, month, limit } = req.query;

    const parsedLimit = Number(limit) || 0;

    const buildQuery = () => {
      let query = { user: userId };

      // Exact date filter
      if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
      }

      // Month filter (format: 2026-02)
      if (month) {
        const [year, monthValue] = month.split("-");
        const start = new Date(year, monthValue - 1, 1);
        const end = new Date(year, monthValue, 0, 23, 59, 59);
        query.date = { $gte: start, $lte: end };
      }

      return query;
    };

    let incomeData = [];
    let expenseData = [];

    // Fetch income if needed
    if (!type || type === "all" || type === "income") {
      incomeData = await Income.find(buildQuery())
        .populate("category", "title color")
        .sort({ date: -1 })
        .lean();
    }

    // Fetch expense if needed
    if (!type || type === "all" || type === "expense") {
      expenseData = await Expense.find(buildQuery())
        .populate("category", "title color")
        .sort({ date: -1 })
        .lean();
    }

    const incomeTx = incomeData.map((i) => ({
      ...i,
      type: "income"
    }));

    const expenseTx = expenseData.map((e) => ({
      ...e,
      type: "expense"
    }));

    let allTransactions = [...incomeTx, ...expenseTx].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Apply limit AFTER merge when type is "all"
    if (parsedLimit) {
      allTransactions = allTransactions.slice(0, parsedLimit);
    }

    res.status(200).json(allTransactions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load transactions" });
  }
};