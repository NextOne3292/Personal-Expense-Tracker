import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* 🔊 success sound */
const successSound = new Audio("/success.mp3");

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Proper token validation
  const token = localStorage.getItem("token");
  const isAuth =
    token && token !== "undefined" && token !== "null";

  /* ---------- Logout ---------- */
  const handleLogout = () => {
    localStorage.removeItem("token");

    successSound.currentTime = 0;
    successSound.play();

    toast.success("Logged out successfully");
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="bg-slate-900 text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <h1 className="text-xl font-bold tracking-wide">
          <Link
            to={isAuth ? "/dashboard" : "/"}
            className="hover:text-slate-300 transition"
          >
            Track<span className="text-slate-300">Wise</span>
          </Link>
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {!isAuth ? (
            <>
              <Link to="/login" className="hover:text-slate-300">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="hover:text-slate-300">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="hover:text-slate-300">
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-800 px-4 py-2 space-y-2 shadow-lg">
          {!isAuth ? (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full px-3 py-1.5 text-sm rounded hover:bg-slate-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block w-full px-3 py-1.5 text-sm rounded hover:bg-slate-700"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block w-full px-3 py-1.5 text-sm rounded hover:bg-slate-700"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;