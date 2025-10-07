import React, { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";

interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category?: string;
  source?: string;
  merchant?: string;
  description?: string;
  date: string;
}

interface MonthCardProps {
  month: string;
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

const MonthCard: React.FC<MonthCardProps> = ({
  month,
  transactions,
  onEdit,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);

  const incomeTotal = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netTotal = incomeTotal - expenseTotal;

  return (
    <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex flex-col md:flex-row md:justify-between md:items-center cursor-pointer px-5 py-4 bg-gradient-to-r from-[#F0FDF4] to-[#E6F4EA] hover:from-[#DCFCE7] hover:to-[#E2F0E8] transition"
        onClick={() => setOpen(!open)}
      >
        <span className="text-lg font-semibold text-[#1B4332] mb-2 md:mb-0">
          {month}
        </span>

        <div className="flex flex-wrap gap-2 md:gap-4 text-sm items-center">
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
            Income: ₹{incomeTotal.toFixed(2)}
          </span>
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-medium">
            Expense: ₹{expenseTotal.toFixed(2)}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md font-bold ${
              netTotal >= 0
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            Net: ₹{netTotal.toFixed(2)}
          </span>
          <span className="ml-auto md:ml-0">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </button>

      {/* Transactions */}
      {open && (
        <div className="p-4">
          {/* Desktop Table */}
          <div className="hidden md:grid grid-cols-6 gap-3 font-semibold text-gray-700 border-b pb-2 text-sm">
            <div>Type / Category</div>
            <div>Merchant</div>
            <div>Description</div>
            <div>Date</div>
            <div className="text-right">Amount</div>
            <div className="text-center">Actions</div>
          </div>

          {/* Mobile: Cards */}
          <div className="space-y-3 md:hidden">
            {transactions.map((t) => (
              <div
                key={t._id}
                className="border rounded-lg p-3 bg-gray-50 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-[#1B4332]">
                    {t.type === "expense"
                      ? t.category || "Expense"
                      : t.source || "Income"}
                  </span>
                  <span
                    className={`font-bold ${
                      t.type === "expense" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {t.type === "expense" ? "-" : "+"}₹{t.amount.toFixed(2)}
                  </span>
                </div>

                {t.merchant && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Merchant: </span>
                    {t.merchant}
                  </p>
                )}
                {t.description && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Description: </span>
                    {t.description}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {new Date(t.date).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => onEdit && onEdit(t)}
                    className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(t._id)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Rows */}
          <div className="hidden md:block">
            {transactions.map((t, idx) => (
              <div
                key={t._id}
                className={`grid grid-cols-6 gap-3 items-center py-3 text-sm ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="font-medium">
                  {t.type === "expense"
                    ? t.category || "Expense"
                    : t.source || "Income"}
                </div>
                <div className="text-gray-600">{t.merchant || "-"}</div>
                <div className="text-gray-500 truncate">
                  {t.description || "-"}
                </div>
                <div className="text-gray-500">
                  {new Date(t.date).toLocaleDateString()}
                </div>
                <div
                  className={`font-semibold text-right ${
                    t.type === "expense" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {t.type === "expense" ? "-" : "+"}₹{t.amount.toFixed(2)}
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit && onEdit(t)}
                    className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(t._id)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthCard;
