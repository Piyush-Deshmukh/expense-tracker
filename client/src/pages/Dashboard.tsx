import { useEffect, useState } from "react";
import KPICard from "../components/KPICard";
import CategoryDonut from "../components/charts/CategoryDonut";
import IncomeExpenseBar from "../components/charts/IncomeExpenseBar";
import NetSavingsLine from "../components/charts/NetSavingsLine";
import TopCategories from "../components/charts/TopMerchants";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { Loader2 } from "lucide-react";

interface KPIData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

// Month/Year dropdown helpers
const getMonthOptions = () => [
  { label: "All Time", value: 0 },
  ...Array.from({ length: 12 }, (_, i) => ({
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
    value: i + 1,
  })),
];

const currentYear = new Date().getFullYear();
const getYearOptions = (range = 5) =>
  Array.from({ length: range }, (_, i) => currentYear - i);

const Dashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const fetchKpis = async () => {
    try {
      setLoading(true);

      if (selectedMonth === 0) {
        // All Time
        const res = await api.get("/stats/monthly", {
          params: { months: 1200 },
        });
        const totalIncome = res.data.reduce(
          (sum: number, d: any) => sum + d.income,
          0
        );
        const totalExpense = res.data.reduce(
          (sum: number, d: any) => sum + d.expense,
          0
        );
        setKpis({
          totalIncome,
          totalExpense,
          netSavings: totalIncome - totalExpense,
        });
      } else {
        // Filter by selected month/year
        const res = await api.get("/stats/monthly", { params: { months: 12 } });
        const monthData = res.data.find(
          (m: any) =>
            new Date(m.month + " 1").getMonth() + 1 === selectedMonth &&
            new Date(m.month + " 1").getFullYear() === selectedYear
        );

        setKpis({
          totalIncome: monthData?.income || 0,
          totalExpense: monthData?.expense || 0,
          netSavings: (monthData?.income || 0) - (monthData?.expense || 0),
        });
      }
    } catch (err) {
      console.error(err);
      setKpis({ totalIncome: 0, totalExpense: 0, netSavings: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, [token, selectedMonth, selectedYear]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
        <span className="ml-2 text-[#2D6A4F] font-medium">
          Loading Dashboard...
        </span>
      </div>
    );

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-[#F8FFF8] to-[#E6F4EA] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D6A4F]">
            📊 Dashboard
          </h1>
          <p className="text-[#1B4332] mt-2">
            Track your income, expenses, and savings in real time.
          </p>
        </div>

        {/* Month / Year selectors */}
        <div className="flex gap-2">
          <select
            className="p-2 border rounded-md"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {getMonthOptions().map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {selectedMonth !== 0 && (
            <select
              className="p-2 border rounded-md"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {getYearOptions(5).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard
          title="Total Income"
          value={kpis?.totalIncome || 0}
          type="income"
        />
        <KPICard
          title="Total Expense"
          value={kpis?.totalExpense || 0}
          type="expense"
        />
        <KPICard
          title="Net Savings"
          value={kpis?.netSavings || 0}
          type="savings"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg p-6 rounded-2xl">
          <h2 className="font-bold text-lg text-[#2D6A4F] mb-4">
            Expenses by Category
          </h2>
          <CategoryDonut month={selectedMonth} year={selectedYear} />
        </div>

        <div className="bg-white shadow-lg p-6 rounded-2xl">
          <h2 className="font-bold text-lg text-[#2D6A4F] mb-4">
            Top Merchants
          </h2>
          <TopCategories month={selectedMonth} year={selectedYear} />
        </div>

        <div className="bg-white shadow-lg p-6 rounded-2xl">
          <h2 className="font-bold text-lg text-[#2D6A4F] mb-4">
            Income vs Expenses (Monthly)
          </h2>
          <IncomeExpenseBar />
        </div>

        <NetSavingsLine />
      </div>
    </div>
  );
};

export default Dashboard;
