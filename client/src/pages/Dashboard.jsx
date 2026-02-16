import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../config/api";

const SidebarLink = ({ label, icon, path, navigate, active }) => (
  <button
    onClick={() => navigate(path)}
    className={`w-full text-left px-3 py-2 rounded transition
      ${active ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800"}
    `}
  >
    {icon} {label}
  </button>
);

const Sidebar = ({ open, navigate }) => {
  const { pathname } = useLocation();

  return (
    <aside
      className={`
        fixed md:static z-40 h-full w-64 bg-gray-900 text-white p-4
        transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <h2 className="text-xl font-bold mb-6">TrackWise</h2>

      <nav className="space-y-2">
        <SidebarLink label="Dashboard" icon="🏠" path="/dashboard" navigate={navigate} active={pathname === "/dashboard"} />
        <SidebarLink label="Add Expense" icon="➕" path="/add-expense" navigate={navigate} active={pathname === "/add-expense"} />
        <SidebarLink label="Add Income" icon="➕" path="/add-income" navigate={navigate} active={pathname === "/add-income"} />
        <SidebarLink label="Categories" icon="📂" path="/categories" navigate={navigate} active={pathname === "/categories"} />
        <SidebarLink label="Transactions" icon="📄" path="/transactions" navigate={navigate} active={pathname === "/transactions"} />
      </nav>
    </aside>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded shadow-sm p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <h2 className={`text-xl font-semibold ${color}`}>
      ₹{Number(value).toLocaleString()}
    </h2>
  </div>
);

const Skeleton = () => (
  <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });
  const [recent, setRecent] = useState([]);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch(`${API_BASE_URL}/dashboard/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) throw new Error();

        const data = await res.json();

        setUserName(data.user?.name || "");
        setTotals(data.totals || { income: 0, expense: 0, balance: 0 });
        setRecent(data.recent || []);

      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar open={sidebarOpen} navigate={navigate} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-6">

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-xl"
          >
            ☰
          </button>
          <h1 className="font-bold text-lg">
            Welcome, {userName}
          </h1>
        </div>

        {/* Desktop Title */}
        <h1 className="hidden md:block text-2xl font-bold mb-6">
          Welcome, {userName}
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <>
              <StatCard label="Income" value={totals.income} color="text-green-600" />
              <StatCard label="Expense" value={totals.expense} color="text-red-600" />
              <StatCard label="Balance" value={totals.balance} color="text-gray-800" />
            </>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Recent Transactions
          </h2>

          <button
            onClick={() => navigate("/transactions")}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            See all
          </button>
        </div>

        {loading && <Skeleton />}

        {!loading && recent.length === 0 && (
          <p className="text-gray-500">No transactions yet</p>
        )}

        {!loading && recent.map(tx => (
          <div
            key={tx._id}
            className="bg-white rounded shadow-sm p-4 mb-2 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                {tx.category?.title || "Uncategorized"}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(tx.date).toDateString()}
              </p>
            </div>

            <p className={`font-semibold ${
              tx.type === "expense" ? "text-red-600" : "text-green-600"
            }`}>
              {tx.type === "expense" ? "-" : "+"}₹
              {Number(tx.amount).toLocaleString()}
            </p>
          </div>
        ))}

      </main>
    </div>
  );
};

export default Dashboard;