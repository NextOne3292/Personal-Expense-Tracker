import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";
export const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const incomes = await Income.find({ user: userId })
      .populate("category", "title icon color type")
      .lean();

    const expenses = await Expense.find({ user: userId })
      .populate("category", "title icon color type")
      .lean();

    const totalIncome = incomes.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const totalExpense = expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const balance = totalIncome - totalExpense;

    const incomeTx = incomes.map(i => ({
      _id: i._id,
      title: i.title,
      amount: i.amount,
      date: i.date,
      category: i.category,
      type: "income"
    }));

    const expenseTx = expenses.map(e => ({
      _id: e._id,
      title: e.title,
      amount: e.amount,
      date: e.date,
      category: e.category,
      type: "expense"
    }));

    const recentTransactions = [...incomeTx, ...expenseTx]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.status(200).json({
      user: {
        name: req.user.name
      },
      totals: {
        income: totalIncome,
        expense: totalExpense,
        balance
      },
      recent: recentTransactions
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};