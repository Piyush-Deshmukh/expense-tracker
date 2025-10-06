import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import api from "../../services/api";

const COLORS = ["#FF6B6B", "#FFA94D", "#FFD43B", "#69DB7C", "#4D96FF"];

interface TopMerchantsProps {
  month?: number; // 0 = All Time
  year?: number;
  type?: "income" | "expense";
  limit?: number;
}

const TopMerchants: React.FC<TopMerchantsProps> = ({
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
  type = "expense",
  limit = 5,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Build query params
        const params: any = { limit, type };
        if (month && month !== 0) params.month = month;
        if (month !== 0) params.year = year;

        const res = await api.get("/stats/top-merchants", { params });
        setData(res.data || []);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year, type, limit]);

  if (loading)
    return <p className="text-center text-gray-500">Loading top merchants...</p>;

  if (!data || data.length === 0)
    return <p className="text-center text-gray-500">No top merchants data available.</p>;

  const totalValue = data.reduce((sum, item) => sum + item.total, 0);
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: ((item.total / totalValue) * 100).toFixed(1),
  }));

  // Dynamically calculate YAxis width based on longest label
  const maxLabelLength = Math.max(...data.map((d) => d.name.length));
  const yAxisWidth = Math.min(Math.max(maxLabelLength * 8, 80), 140); // min 80, max 140

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={dataWithPercentage}
        layout="vertical"
        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "#475569", fontSize: 12 }}
          tickFormatter={(value) => `₹${value}`}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fill: "#475569", fontSize: 14 }}
          width={yAxisWidth}
        />
        <Tooltip
          formatter={(value, name) => [`₹${value}`, String(name)]}
          contentStyle={{
            borderRadius: "10px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        />
        <Bar dataKey="total" radius={[0, 10, 10, 0]}>
          {dataWithPercentage.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList
            dataKey="percentage"
            position="insideRight"
            formatter={(val) => `${val}%`}
            fill="#ffffff"
            fontSize={12}
            offset={10}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopMerchants;
