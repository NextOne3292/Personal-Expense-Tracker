import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import AddIncome from "./pages/AddIncome";
import Transactions from "./pages/Transaction";
import Categories from "./pages/Categories";

/* 🔐 Protected Route */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Toaster position="top-right" />

        <Header />

        <main className="flex-grow">
          <Routes>

            {/* 🌍 Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 🔒 Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-expense"
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-income"
              element={
                <ProtectedRoute>
                  <AddIncome />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />

            {/* 📂 Categories */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />

            {/* ❓ Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
