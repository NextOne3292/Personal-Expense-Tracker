import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://localhost:3000/api/categories";

/* 🔊 success sound */
const successSound = new Audio("/success.mp3");

const Categories = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("expense");
  const [color, setColor] = useState("#3b82f6");

  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  /* ---------- Fetch categories ---------- */
  const fetchCategories = async () => {
    try {
      const url = filter === "all" ? API : `${API}?type=${filter}`;
      const res = await fetch(url, { headers: authHeaders() });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filter]);

  /* ---------- Add / Update ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Category name required");
      return;
    }

    const url = editingId ? `${API}/${editingId}` : API;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          title: title.trim(),
          type,
          color
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Action failed");
        return;
      }

      successSound.currentTime = 0;
      successSound.play();

      toast.success(
        editingId ? "Category updated" : "Category added"
      );

      resetForm();
      fetchCategories();
    } catch {
      toast.error("Server error");
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Delete failed");
        return;
      }

      successSound.currentTime = 0;
      successSound.play();

      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Server error");
    }
  };

  /* ---------- Edit ---------- */
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setTitle(cat.title);
    setType(cat.type);
    setColor(cat.color || "#3b82f6");
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setType("expense");
    setColor("#3b82f6");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded mb-6 space-y-3"
      >
        <input
          placeholder="Category name"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex gap-3">
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="flex-1 border p-2 rounded"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </div>

        <button className="bg-blue-600 text-white p-2 rounded w-full">
          {editingId ? "Update Category" : "Add Category"}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        categories.map(cat => (
          <div
            key={cat._id}
            className="flex justify-between items-center border rounded p-3 mb-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ background: cat.color }}
              />
              <span>{cat.title}</span>
              <span className="text-xs text-gray-500">
                {cat.type}
              </span>
            </div>

            {!cat.isDefault && (
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(cat)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Categories;