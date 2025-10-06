import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Expenses", path: "/expenses" },
  ];

  return (
    <nav className="bg-[#2D6A4F] text-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-[#EDF7EF]">
            Expense Tracker
          </Link>

          {/* Desktop Links */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded hover:bg-[#1B4332] transition ${
                  location.pathname === link.path ? "bg-[#1B4332]" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User / Auth */}
          <div className="hidden sm:flex sm:items-center sm:space-x-3">
            {user ? (
              <>
                <span className="text-sm">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 cursor-pointer px-3 py-1 rounded shadow transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1 hover:underline">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#FFB703] text-[#1B4332] px-3 py-1 rounded shadow hover:bg-[#FFB703]/90 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none"
            >
              {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[#2D6A4F] px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded hover:bg-[#1B4332] transition ${
                location.pathname === link.path ? "bg-[#1B4332]" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full text-left bg-red-500 cursor-pointer hover:bg-red-600 px-3 py-2 rounded shadow transition"
            >
              Logout
            </button>
          ) : (
            <div className="space-y-1">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded hover:bg-[#1B4332] transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block bg-[#FFB703] text-[#1B4332] px-3 py-2 rounded shadow hover:bg-[#FFB703]/90 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
