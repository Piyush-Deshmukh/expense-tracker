import { useEffect, useState } from "react";
import api from "../services/api";
import MonthCard from "../components/MonthCard";
import TransactionForm from "../components/TransactionForm";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { toast } from "react-toastify";

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

const Expenses = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transactions");
      setTransactions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleEdit = (t: Transaction) => {
    setEditing(t);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      fetchTransactions(); // refresh after delete
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transaction");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FFF8] to-[#E6F4EA]">
      <div className="max-w-3xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#2D6A4F]">
            Expenses & Income
          </h1>
          <button
            onClick={handleAdd}
            className="bg-[#2D6A4F] cursor-pointer hover:bg-[#1B4332] text-white px-4 py-2 rounded-lg shadow"
          >
            + Add Transaction
          </button>
        </div>

        {/* Transactions */}
        <div>
          {loading && <p className="text-gray-500">Loading transactions...</p>}
          {!loading && !transactions.length && (
            <p className="text-gray-500">No transactions found.</p>
          )}

          {!loading &&
            transactions.length > 0 &&
            // group by month
            Object.entries(
              transactions.reduce((map: any, t) => {
                const date = new Date(t.date);
                const monthStr = date.toLocaleString("default", {
                  month: "short",
                });
                const year = date.getFullYear();
                const key = `${monthStr} ${year}`;
                if (!map[key]) map[key] = [];
                map[key].push(t);
                return map;
              }, {})
            )
              .sort(
                (a: any, b: any) =>
                  new Date(b[1][0].date).getTime() -
                  new Date(a[1][0].date).getTime()
              )
              .map(([month, monthTx]: any) => (
                <MonthCard
                  key={month}
                  month={month}
                  transactions={monthTx}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <DialogTitle className="text-lg font-bold mb-4 text-[#2D6A4F]">
              {editing ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
            <TransactionForm
              initialData={editing || undefined}
              onSuccess={() => {
                setIsModalOpen(false);
                fetchTransactions();
              }}
            />
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default Expenses;
