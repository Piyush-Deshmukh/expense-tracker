import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("Registration successful!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D8F3DC] to-[#EDF7EF] px-4">
      <form className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-extrabold mb-6 text-[#2D6A4F] text-center">
          Create Account
        </h2>

        <div className="mb-4">
          <label className="block text-[#1B4332] mb-1" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-[#95D5B2] p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] transition"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-[#1B4332] mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#95D5B2] p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] transition"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-[#1B4332] mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-[#95D5B2] p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 cursor-pointer rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-[#95D5B2] cursor-not-allowed"
              : "bg-[#2D6A4F] hover:bg-[#1B4332]"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-6 text-center text-[#1B4332]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#FFB703] font-medium hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
