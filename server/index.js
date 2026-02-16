import "dotenv/config";
import "./config/db.js";

import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

/* ==============================
   Middlewares
============================== */

app.use(cors({
  origin: process.env.CLIENT_URL || "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==============================
   Routes
============================== */

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);

/* ==============================
   Health Check
============================== */

app.get("/", (req, res) => {
  res.status(200).send("Expense Tracker API running 🚀");
});

/* ==============================
   404 Handler
============================== */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ==============================
   Start Server
============================== */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});