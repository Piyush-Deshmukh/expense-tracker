import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

interface TransactionFormProps {
  onSuccess?: () => void;
  initialData?: {
    _id?: string;
    type: "income" | "expense";
    amount: number;
    category?: string;
    source?: string;
    merchant?: string;
    description?: string;
    date: string;
  };
}

const FIXED_CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Health",
  "Entertainment",
  "Utilities",
  "Others",
];

const FIXED_SOURCES = ["Salary", "Freelance", "Investments", "Gift", "Others"];

const FIXED_MERCHANTS = ["UPI", "Cash", "Bank Transfer", "Card", "Other"];

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSuccess,
  initialData,
}) => {
  const [type, setType] = useState<"income" | "expense">(
    initialData?.type || "expense"
  );
  const [amount, setAmount] = useState<number>(initialData?.amount || 0);
  const [category, setCategory] = useState(initialData?.category || "");
  const [source, setSource] = useState(initialData?.source || "");
  const [merchant, setMerchant] = useState(initialData?.merchant || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [date, setDate] = useState<string>(
    initialData?.date || new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setType("expense");
    setAmount(0);
    setCategory("");
    setSource("");
    setMerchant("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return toast.error("Amount must be greater than 0");
    if (type === "expense" && !category)
      return toast.error("Please select a category");
    if (type === "income" && !source)
      return toast.error("Please select a source");

    setLoading(true);
    try {
      const payload = {
        type,
        amount,
        category: type === "expense" ? category : undefined,
        source: type === "income" ? source : undefined,
        merchant,
        description,
        date,
      };

      if (initialData?._id) {
        await api.put(`/transactions/${initialData._id}`, payload);
        toast.success("Transaction updated!");
      } else {
        await api.post("/transactions", payload);
        toast.success("Transaction added!");
        resetForm();
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="bg-white shadow-lg rounded-2xl p-6 space-y-4 max-w-md mx-auto"
      onSubmit={handleSubmit}
    >
      {/* Type toggle */}
      <div className="flex gap-2">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t as "income" | "expense")}
            className={`flex-1 py-2 rounded-2xl cursor-pointer font-semibold transition ${
              type === t
                ? t === "expense"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Amount */}
      <input
        type="number"
        placeholder="Amount"
        className="w-full border border-gray-300 rounded-2xl p-2 focus:ring-2 focus:ring-green-200 focus:outline-none"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        min={0}
        step={0.01}
        required
      />

      {/* Category / Source dropdowns */}
      {type === "expense" && (
        <select
          className="w-full cursor-pointer border border-gray-300 rounded-2xl p-2 focus:ring-2 focus:ring-red-200 focus:outline-none"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {FIXED_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}
      {type === "income" && (
        <select
          className="w-full cursor-pointer border border-gray-300 rounded-2xl p-2 focus:ring-2 focus:ring-green-200 focus:outline-none"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        >
          <option value="">Select Source</option>
          {FIXED_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {/* Merchant */}
      <select
        className="w-full cursor-pointer border border-gray-300 rounded-2xl p-2 focus:ring-2 focus:ring-blue-100 focus:outline-none"
        value={merchant}
        onChange={(e) => setMerchant(e.target.value)}
      >
        <option value="">Select Merchant / Payment</option>
        {FIXED_MERCHANTS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* Description */}
      <textarea
        placeholder="Description"
        className="w-full border border-gray-300 rounded-2xl p-2 focus:ring-2 focus:ring-blue-100 focus:outline-none"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Date */}
      <input
        type="date"
        className="w-full border cursor-pointer border-gray-300 rounded-2xl p-2 focus:ring-2 focus:ring-blue-100 focus:outline-none"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {/* Submit */}
      <button
        type="submit"
        className={`w-full py-2 rounded-2xl cursor-pointer font-bold text-white transition ${
          loading ? "bg-gray-400" : "bg-[#2D6A4F] hover:bg-[#1B4332]"
        }`}
        disabled={loading}
      >
        {loading
          ? "Saving..."
          : initialData?._id
          ? "Update Transaction"
          : "Add Transaction"}
      </button>
    </form>
  );
};

export default TransactionForm;
