import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-medium mb-3">{title}</p>
          <p className="text-4xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`${iconBgColor} p-3 rounded-lg ${iconColor} group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
