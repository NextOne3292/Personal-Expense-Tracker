import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const successSound = new Audio("./success.mp3");

const TransactionForm = ({ type }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const isIncome = type === "income";

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    note: ""
  });

  const [categories, setCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE =
    type === "income"
      ? "http://localhost:3000/api/income"
      : "http://localhost:3000/api/expenses";

  const textColor = isIncome ? "text-green-600" : "text-red-600";
  const buttonColor = isIncome
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-600 hover:bg-red-700";

  /* -------- Fetch categories -------- */
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:3000/api/categories", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setCategories(data.filter(cat => cat.type === type));
      } catch {
        toast.error(`Failed to load ${type} categories`);
      }
    };

    fetchCategories();
  }, [type]);

  /* -------- Fetch edit data -------- */
  useEffect(() => {
    if (!editId) return;

    const fetchTransaction = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${API_BASE}/${editId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          toast.error(`Failed to load ${type}`);
          navigate("/transactions");
          return;
        }

        const data = await res.json();

        setFormData({
          title: data.title,
          amount: data.amount,
          category: data.category?._id || data.category,
          date: data.date?.slice(0, 10) || "",
          note: data.note || ""
        });
      } catch {
        toast.error("Server error");
      }
    };

    fetchTransaction();
  }, [editId, API_BASE, navigate, type]);

  /* -------- Fetch recent (via unified transactions API) -------- */
  useEffect(() => {
    if (editId) return;

    const fetchRecent = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `http://localhost:3000/api/transactions?type=${type}&limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setRecentTransactions(data);
      } catch (err) {
        console.error("Failed to fetch recent", err);
      }
    };

    fetchRecent();
  }, [editId, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const url = editId ? `${API_BASE}/${editId}` : API_BASE;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save");
        return;
      }

      successSound.currentTime = 0;
      successSound.play();

      toast.success(
        editId
          ? `${type} updated`
          : `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`
      );

      if (editId) {
        navigate("/transactions");
        return;
      }

      // update recent locally without refetch
      setRecentTransactions(prev => [data, ...prev].slice(0, 5));

      setFormData({
        title: "",
        amount: "",
        category: "",
        date: "",
        note: ""
      });

    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {editId ? `Edit ${type}` : `Add ${type}`}
      </h1>

      {!editId && !loading && categories.length === 0 && (
        <div className="border border-dashed rounded-lg p-6 text-center bg-gray-50 mb-6">
          <p className="text-lg font-semibold text-gray-700">
            No {type} categories yet
          </p>
          <button
            onClick={() => navigate("/categories")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            type="button"
          >
            + Add Category
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder={`${type} title`}
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={categories.length === 0}
          className="w-full border p-2 rounded disabled:bg-gray-100"
          required
        >
          <option value="">Select category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.title}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <textarea
          name="note"
          placeholder="Note (optional)"
          value={formData.note}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading || categories.length === 0}
          className={`w-full text-white p-3 rounded disabled:opacity-50 ${buttonColor}`}
        >
          {loading ? "Saving..." : `Save ${type}`}
        </button>
      </form>

      {!editId && recentTransactions.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">
              Recent {type}
            </h2>

            <button
              onClick={() => navigate("/transactions")}
              className="text-blue-600 hover:underline text-sm font-medium"
              type="button"
            >
              See all
            </button>
          </div>

          <div className="space-y-2">
            {recentTransactions.map(tx => (
              <div
                key={tx._id}
                className="flex justify-between items-center border rounded px-3 py-2 hover:bg-gray-50"
              >
                <span className="font-medium">{tx.title}</span>

                <span className={`font-semibold ${textColor}`}>
                  ₹{Number(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionForm;