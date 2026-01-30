import "dotenv/config";
import "./config/db.js";
import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) =>
  res.send("Expense Tracker API running 🚀")
);

app.listen(port, () =>
  console.log(`ExpenseTracker app listening on port ${port}`)
);
