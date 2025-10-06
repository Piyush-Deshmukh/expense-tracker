import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import api from "../../services/api";

type RawPoint = { date: string; net: number | string };
type Point = { date: string; net: number; cumulative: number };

const formatINR = (v: number) =>
  v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const NetSavingsLine = ({ start, end }: { start?: string; end?: string }) => {
  const [raw, setRaw] = useState<RawPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // allow optional start/end props; fall back to previous fixed range
        const params: any = {};
        if (start) params.start = start;
        if (end) params.end = end;

        const url = Object.keys(params).length ? "/stats/net" : "/stats/net";
        const res = await api.get(url, { params });
        setRaw(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("NetSavings fetch error:", err);
        setRaw([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [start, end]);

  // Normalize, sort by date, and compute cumulative net
  const data: Point[] = useMemo(() => {
    if (!raw || raw.length === 0) return [];

    const normalized = raw
      .map((r) => ({
        date: r.date,
        net: typeof r.net === "string" ? Number(r.net) || 0 : Number(r.net || 0),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulative = 0;
    return normalized.map((p) => {
      cumulative += p.net;
      return { ...p, cumulative };
    });
  }, [raw]);

  // Trend: compare last two cumulative points safely
  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const last = data[data.length - 1].cumulative;
    const prev = data[data.length - 2].cumulative;
    const diff = last - prev;
    const percent = prev !== 0 ? ((diff / Math.abs(prev)) * 100) : null;
    return { diff, percent: percent === null ? null : Number(percent.toFixed(1)), up: diff >= 0, last };
  }, [data]);

  // Y domain with small padding so area/line fill uses height well
  const yDomain = useMemo(() => {
    if (!data || data.length === 0) return ["auto", "auto"];
    const vals = data.map((d) => d.cumulative);
    const min = Math.min(...vals, 0);
    const max = Math.max(...vals, 0);
    const padding = Math.max((max - min) * 0.12, 10); // 12% padding or minimum 10
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [data]);

  if (loading) return <p className="text-center text-gray-500">Loading net savings...</p>;
  if (!data || data.length === 0)
    return <p className="text-center text-gray-500">No net savings data available.</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      {/* Header + Trend + Current Balance */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2D6A4F]">Net Savings Over Time</h2>
          <p className="text-sm text-gray-600 mt-1">Cumulative savings (income − expense).</p>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">Current Balance</div>
          <div className="text-2xl font-extrabold text-gray-900">
            {formatINR(trend?.last ?? 0)}
          </div>
          {trend && (
            <div className={`mt-1 flex items-center justify-end text-sm font-medium ${trend.up ? "text-green-600" : "text-red-600"}`}>
              {trend.up ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span className="ml-1">
                {trend.diff >= 0 ? "+" : ""}
                {formatINR(trend.diff)}
                {trend.percent !== null ? ` • ${Math.abs(trend.percent)}%` : " • —"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 6 }} // small bottom for tighter fit
        >
          <defs>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#475569", fontSize: 12 }}
            tickFormatter={(dateStr: string) => {
              const d = new Date(dateStr);
              return `${d.getDate()}/${d.getMonth() + 1}`; // compact mm/dd
            }}
            minTickGap={12}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 12 }}
            domain={yDomain as any}
            tickFormatter={(v) => {
              // avoid scientific format for large or negative numbers
              return v >= 1000 || v <= -1000 ? `₹${Number(v).toLocaleString()}` : `₹${v}`;
            }}
          />
          <Tooltip
            formatter={(value: any) => [formatINR(Number(value)), "Balance"]}
            labelFormatter={(label: string) => `Date: ${new Date(label).toLocaleDateString()}`}
            contentStyle={{
              borderRadius: "10px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          />

          {/* filled area + stroke */}
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#2D6A4F"
            strokeWidth={2.5}
            fill="url(#netGradient)"
            dot={{ r: 3, fill: "#2D6A4F" }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />

          {/* Optional accent line on top for crisp stroke */}
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#2D6A4F"
            strokeWidth={1}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetSavingsLine;
