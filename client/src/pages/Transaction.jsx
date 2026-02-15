import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const successSound = new Audio("/success.mp3");

const Transactions = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filter !== "all") {
        params.append("type", filter);
      }

      if (selectedDate) {
        params.append("date", selectedDate);
      }

      if (selectedMonth) {
        params.append("month", selectedMonth);
      }

      const res = await fetch(
        `http://localhost:3000/api/transactions?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load transactions");
        return;
      }

      setTransactions(data);

    } catch {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter, selectedDate, selectedMonth]);

  const handleDelete = async (tx) => {
    if (!window.confirm("Do you want to delete this transaction?")) return;

    const url =
      tx.type === "income"
        ? `http://localhost:3000/api/income/${tx._id}`
        : `http://localhost:3000/api/expenses/${tx._id}`;

    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Delete failed");
        return;
      }

      successSound.currentTime = 0;
      successSound.play();

      toast.success("Transaction deleted successfully");
      fetchTransactions();

    } catch {
      toast.error("Server error");
    }
  };

  const handleEdit = (tx) => {
    if (tx.type === "income") {
      navigate(`/add-income?edit=${tx._id}`);
    } else {
      navigate(`/add-expense?edit=${tx._id}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedMonth("");
          }}
          className="border rounded p-2"
        />

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setSelectedDate("");
          }}
          className="border rounded p-2"
        />

      </div>

      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && transactions.length === 0 && (
        <p className="text-sm text-gray-400">No transactions found</p>
      )}

      <div className="space-y-4">
        {transactions.map(tx => (
          <div key={tx._id} className="border rounded p-4 bg-white">

            <div className="flex justify-between">
              <h3 className="font-semibold">{tx.title}</h3>
              <span
                className={`font-medium ${
                  tx.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}₹
                {Number(tx.amount).toLocaleString()}
              </span>
            </div>

            <div className="text-sm text-gray-500 mt-1 flex gap-2 items-center">
              <span>{new Date(tx.date).toLocaleDateString()}</span>

              {tx.category && (
                <span
                  className="px-2 py-0.5 rounded text-white text-xs"
                  style={{ backgroundColor: tx.category.color }}
                >
                  {tx.category.title}
                </span>
              )}
            </div>

            {tx.note && (
              <p className="text-sm text-gray-700 mt-2">
                📝 {tx.note}
              </p>
            )}

            <div className="flex gap-4 mt-3 text-sm">
              <button
                onClick={() => handleEdit(tx)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(tx)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;