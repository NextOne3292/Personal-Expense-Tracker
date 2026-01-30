
// controllers/dashboardController.js
import mongoose from "mongoose";
import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";
import Category from "../models/categoryModel.js";

/** Safe ObjectId conversion: accepts ObjectId or string */
const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === "object" && id._bsontype === "ObjectID") return id;
  return new mongoose.Types.ObjectId(String(id));
};

/**
 * Helper: build optional date match from query params:
 * Accepts startDate / endDate (ISO strings) OR month & year.
 */
function buildDateMatch(query) {
  const match = {};
  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) match.date.$gte = new Date(query.startDate);
    if (query.endDate) match.date.$lte = new Date(query.endDate);
  } else if (query.month && query.year) {
    const y = parseInt(query.year, 10);
    const m = parseInt(query.month, 10);
    if (!isNaN(y) && !isNaN(m)) {
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
      match.date = { $gte: start, $lte: end };
    }
  }
  return match;
}

/* OVERVIEW: totals, balance, recent transactions (uses $unionWith for correctness) */
export const getOverview = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const { startDate, endDate, month, year, recent: recentParam = "10" } = req.query;

    const dateMatch = buildDateMatch({ startDate, endDate, month, year });
    const limit = Math.min(parseInt(recentParam, 10) || 10, 100);

    // Totals (small aggregations)
    const incomeAgg = Income.aggregate([
  { $match: { user: userId } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
]).allowDiskUse(true);

const expenseAgg = Expense.aggregate([
  { $match: { user: userId } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
]).allowDiskUse(true);

    // Recent transactions using server-side union, sort, limit, and lookups
    const transactionsPipeline = [
      { $match: { user: userId, ...(dateMatch.date ? { date: dateMatch.date } : {}) } },
      {
        $project: {
          amount: 1,
          date: 1,
          note: 1,
          category: 1,
          user: 1,
          createdAt: 1,
          _type: { $literal: "income" }
        }
      },
      {
        $unionWith: {
          coll: "expenses",
          pipeline: [
            { $match: { user: userId, ...(dateMatch.date ? { date: dateMatch.date } : {}) } },
            {
              $project: {
                amount: 1,
                date: 1,
                note: 1,
                category: 1,
                user: 1,
                createdAt: 1,
                _type: { $literal: "expense" }
              }
            }
          ]
        }
      },
      { $sort: { date: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          amount: 1,
          date: 1,
          note: 1,
          _type: 1,
          "category._id": 1,
          "category.title": 1,
          "category.icon": 1,
          "category.color": 1,
          "category.type": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1
        }
      }
    ];

    const [incomeRes, expenseRes, recentTransactions] = await Promise.all([
      incomeAgg.exec(),
      expenseAgg.exec(),
      // start aggregation on Income collection and union with expenses
      Income.aggregate(transactionsPipeline).allowDiskUse(true).exec()
    ]);

    const incomeTotal = (incomeRes[0] && incomeRes[0].total) || 0;
    const expenseTotal = (expenseRes[0] && expenseRes[0].total) || 0;
    const balance = incomeTotal - expenseTotal;

    return res.status(200).json({
      totals: { income: incomeTotal, expense: expenseTotal, balance },
      recent: recentTransactions
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* DAILY: return totals grouped by day for a month or custom range */
export const getDaily = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const { startDate, endDate, month, year } = req.query;
    const dateMatchObj = buildDateMatch({ startDate, endDate, month, year });

    const baseMatch = { user: userId, ...(dateMatchObj.date ? { date: dateMatchObj.date } : {}) };

    const dailyAgg = async (Model, type) => {
      const pipeline = [
        { $match: baseMatch },
        {
          $group: {
            _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ];
      const result = await Model.aggregate(pipeline).allowDiskUse(true).exec();
      return result.map((r) => ({ date: r._id.date, total: r.total, count: r.count, type }));
    };

    const [incomeDaily, expenseDaily] = await Promise.all([dailyAgg(Income, "income"), dailyAgg(Expense, "expense")]);

    const map = new Map();
    incomeDaily.forEach((d) => {
      map.set(d.date, { date: d.date, income: d.total, incomeCount: d.count, expense: 0, expenseCount: 0 });
    });
    expenseDaily.forEach((d) => {
      if (!map.has(d.date)) {
        map.set(d.date, { date: d.date, income: 0, incomeCount: 0, expense: d.total, expenseCount: d.count });
      } else {
        const cur = map.get(d.date);
        cur.expense = d.total;
        cur.expenseCount = d.count;
        map.set(d.date, cur);
      }
    });

    const daily = Array.from(map.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
    return res.status(200).json({ daily });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* MONTHLY: totals grouped by month for a given year or across date range */
export const getMonthly = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    const match = { user: userId, date: { $gte: start, $lte: end } };

    const pipeline = (Model) => [
      { $match: match },
      {
        $group: {
          _id: { month: { $dateToString: { format: "%Y-%m", date: "$date" } } },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ];

    const [incRes, expRes] = await Promise.all([Income.aggregate(pipeline(Income)).allowDiskUse(true).exec(), Expense.aggregate(pipeline(Expense)).allowDiskUse(true).exec()]);

    const map = new Map();
    incRes.forEach((r) => {
      const key = r._id.month;
      map.set(key, { month: key, income: r.total, incomeCount: r.count, expense: 0, expenseCount: 0 });
    });
    expRes.forEach((r) => {
      const key = r._id.month;
      if (!map.has(key)) {
        map.set(key, { month: key, income: 0, incomeCount: 0, expense: r.total, expenseCount: r.count });
      } else {
        const cur = map.get(key);
        cur.expense = r.total;
        cur.expenseCount = r.count;
        map.set(key, cur);
      }
    });

    const monthly = Array.from(map.values()).sort((a, b) => (a.month > b.month ? 1 : -1));
    return res.status(200).json({ year, monthly });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* YEARLY: totals grouped by year across all data or limited range */
export const getYearly = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const { startYear, endYear } = req.query;
    const start = startYear ? new Date(Date.UTC(parseInt(startYear, 10), 0, 1)) : undefined;
    const end = endYear ? new Date(Date.UTC(parseInt(endYear, 10), 11, 31, 23, 59, 59, 999)) : undefined;

    const makeMatch = () => {
      const m = { user: userId };
      if (start || end) m.date = {};
      if (start) m.date.$gte = start;
      if (end) m.date.$lte = end;
      return m;
    };

    const pipeline = (Model) => [
      { $match: makeMatch() },
      {
        $group: {
          _id: { year: { $dateToString: { format: "%Y", date: "$date" } } },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1 } }
    ];

    const [incRes, expRes] = await Promise.all([Income.aggregate(pipeline(Income)).allowDiskUse(true).exec(), Expense.aggregate(pipeline(Expense)).allowDiskUse(true).exec()]);

    const map = new Map();
    incRes.forEach((r) => {
      const key = r._id.year;
      map.set(key, { year: key, income: r.total, incomeCount: r.count, expense: 0, expenseCount: 0 });
    });
    expRes.forEach((r) => {
      const key = r._id.year;
      if (!map.has(key)) {
        map.set(key, { year: key, income: 0, incomeCount: 0, expense: r.total, expenseCount: r.count });
      } else {
        const cur = map.get(key);
        cur.expense = r.total;
        cur.expenseCount = r.count;
        map.set(key, cur);
      }
    });

    const yearly = Array.from(map.values()).sort((a, b) => (a.year > b.year ? 1 : -1));
    return res.status(200).json({ yearly });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* Category breakdown (expense or income by category) */
export const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const { type = "expense", startDate, endDate } = req.query;
    const Model = type === "income" ? Income : Expense;
    const dateMatch = buildDateMatch({ startDate, endDate });

    const match = { user: userId, ...(dateMatch.date ? { date: dateMatch.date } : {}) };

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          title: "$category.title",
          icon: "$category.icon",
          color: "$category.color",
          type: "$category.type",
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ];

    const resAgg = await Model.aggregate(pipeline).allowDiskUse(true).exec();
    return res.status(200).json({ type, breakdown: resAgg });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* TRANSACTIONS: combined list of incomes and expenses with pagination (server-side aggregation) */
export const getTransactions = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 200);
    const { startDate, endDate, type } = req.query;

    const dateMatch = buildDateMatch({ startDate, endDate });
    const baseMatch = { user: userId, ...(dateMatch.date ? { date: dateMatch.date } : {}) };

    const incomePipeline = [
      { $match: baseMatch },
      {
        $project: {
          amount: 1,
          date: 1,
          note: 1,
          category: 1,
          user: 1,
          createdAt: 1,
          _type: { $literal: "income" }
        }
      }
    ];

    const expensePipeline = [
      { $match: baseMatch },
      {
        $project: {
          amount: 1,
          date: 1,
          note: 1,
          category: 1,
          user: 1,
          createdAt: 1,
          _type: { $literal: "expense" }
        }
      }
    ];

    const combinedPipeline = [
      ...incomePipeline,
      {
        $unionWith: {
          coll: "expenses",
          pipeline: expensePipeline
        }
      }
    ];

    if (type === "income" || type === "expense") {
      combinedPipeline.push({ $match: { _type: type } });
    }

    combinedPipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          amount: 1,
          date: 1,
          note: 1,
          _type: 1,
          "category._id": 1,
          "category.title": 1,
          "category.icon": 1,
          "category.color": 1,
          "category.type": 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          createdAt: 1
        }
      },
      { $sort: { date: -1, createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
        }
      }
    );

    const aggRes = await Income.aggregate(combinedPipeline).allowDiskUse(true).exec();
    const meta = (aggRes[0] && aggRes[0].metadata && aggRes[0].metadata[0]) || { total: 0 };
    const transactions = (aggRes[0] && aggRes[0].data) || [];

    return res.status(200).json({
      page,
      limit,
      total: meta.total || 0,
      transactions
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
