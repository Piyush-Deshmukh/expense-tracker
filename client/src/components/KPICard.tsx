import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  className?: string;
  type?: "income" | "expense" | "savings";
}

const iconMap = {
  income: <TrendingUp className="w-6 h-6 text-green-500" />,
  expense: <TrendingDown className="w-6 h-6 text-red-500" />,
  savings: <Wallet className="w-6 h-6 text-blue-500" />,
};

const KPICard: React.FC<KPICardProps> = ({ title, value, className, type }) => {
  return (
    <div
      className={`bg-white shadow-md hover:shadow-xl transition-shadow rounded-2xl p-6 flex flex-col items-start ${className}`}
    >
      <div className="flex items-center gap-2">
        {type && iconMap[type]}
        <span className="text-gray-600 text-sm font-medium">{title}</span>
      </div>
      <span className="text-3xl font-extrabold mt-3 text-gray-900">
        {value.toLocaleString("en-US", { style: "currency", currency: "INR" })}
      </span>
    </div>
  );
};

export default KPICard;
