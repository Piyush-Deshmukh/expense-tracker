import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import api from "../../services/api";

const COLORS = {
  income: "#2D6A4F", // Green
  expense: "#E63946", // Red
};

const IncomeExpenseChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"bar" | "line">("bar"); // toggle view

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/stats/monthly?months=6");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500">Loading chart...</p>;
  if (!data || data.length === 0)
    return <p className="text-center text-gray-500">No data available.</p>;

  return (
    <div className="bg-white p-4">
      {/* Toggle buttons */}
      <div className="flex justify-end mb-2 space-x-2">
        <button
          onClick={() => setView("bar")}
          className={`px-3 py-1 rounded cursor-pointer ${
            view === "bar" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setView("line")}
          className={`px-3 py-1 rounded cursor-pointer ${
            view === "line" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Trend Lines
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {view === "bar" ? (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => [
                `₹${value}`,
                String(name).charAt(0).toUpperCase() + String(name).slice(1),
              ]}
              contentStyle={{
                borderRadius: "10px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            />
            <Legend verticalAlign="top" />
            <Bar dataKey="income" fill={COLORS.income} barSize={20} radius={[5, 5, 0, 0]} />
            <Bar dataKey="expense" fill={COLORS.expense} barSize={20} radius={[5, 5, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => [
                `₹${value}`,
                String(name).charAt(0).toUpperCase() + String(name).slice(1),
              ]}
              contentStyle={{
                borderRadius: "10px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            />
            <Legend verticalAlign="top" />
            <Line type="monotone" dataKey="income" stroke={COLORS.income} strokeWidth={3} />
            <Line type="monotone" dataKey="expense" stroke={COLORS.expense} strokeWidth={3} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
