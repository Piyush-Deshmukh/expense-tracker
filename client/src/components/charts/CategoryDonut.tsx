import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../../services/api";

// Type-safe Category data
interface CategoryData {
  [key: string]: string | number;
  category: string;
  total: number;
}

const COLORS = [
  "#2D6A4F",
  "#95D5B2",
  "#52B788",
  "#FFB703",
  "#FB8500",
  "#E63946",
  "#6C63FF",
];

// Custom label for donut slices
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface CategoryDonutProps {
  month?: number; // optional
  year?: number;  // optional
}

const CategoryDonut = ({ month, year }: CategoryDonutProps) => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const params: any = {};
        if (month) params.month = month;
        if (year) params.year = year;

        const res = await api.get("/stats/category", { params });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  if (loading)
    return <p className="text-center text-gray-500">Loading chart...</p>;

  if (!data || data.length === 0)
    return <p className="text-center text-gray-500">No expense data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={Math.min(100, window.innerWidth / 6)}
          dataKey="total"
          nameKey="category"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`₹${value}`, name]}
          contentStyle={{
            borderRadius: "10px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryDonut;
