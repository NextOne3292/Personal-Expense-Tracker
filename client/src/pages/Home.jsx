import { Link, Navigate } from "react-router-dom";

const Home = () => {
  const token = localStorage.getItem("token");

  const isAuth =
    token && token !== "undefined" && token !== "null";

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center 
    bg-gradient-to-br from-slate-900 via-slate-800 to-gray-700 
    px-4 sm:px-6">

      <div className="text-center text-white max-w-2xl">
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Track Your Expenses.
          <span className="block text-slate-300">
            Take Control of Your Money.
          </span>
        </h1>

        <p className="text-gray-300 mb-10 text-lg">
          TrackWise helps you manage income, monitor expenses, and gain clear
          insights into your financial habits.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-6 py-3 bg-white text-slate-900 font-medium rounded-md hover:bg-gray-200 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-6 py-3 border border-white text-white font-medium rounded-md hover:bg-white hover:text-slate-900 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
