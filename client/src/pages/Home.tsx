import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D8F3DC] to-[#EDF7EF]">
      <div className="flex flex-col items-center justify-center text-center px-4 py-20 sm:py-32">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#2D6A4F] mb-4">
          Welcome to Expense Tracker 🚀
        </h1>
        <p className="text-lg sm:text-2xl text-[#1B4332] mb-8">
          Easily track your expenses, stay on budget, and manage your finances
          like a pro!
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="bg-[#FFB703] hover:bg-[#FFB703]/90 text-[#1B4332] font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            Login
          </Link>
        </div>

        {/* Optional illustration */}
        <div className="mt-12 w-full max-w-md">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Finance illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
