import "dotenv/config";
import "./config/db.js";        // connects to MongoDB
import express from "express";

import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"

const app = express();
const port = process.env.PORT || 3000;

// Middleware to read JSON body
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);            // signup, login
app.use("/api/categories", categoryRoutes);   // categories
app.use("/api/expenses", expenseRoutes);      // expenses
app.use("/api/income", incomeRoutes);         // income
app.use("/api/dashboard", dashboardRoutes);

// Test route
app.get("/", (req, res) => res.send("Expense Tracker API running 🚀"));

// Start server
app.listen(port, () =>
  console.log(`ExpenseTracker app listening on port ${port}`)
);
