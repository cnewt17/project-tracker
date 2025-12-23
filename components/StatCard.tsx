"use client";

import { LucideIcon } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  animate?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  animate = true,
}: StatCardProps) {
  const numericValue = typeof value === "number" ? value : 0;
  const animatedValue = useCountUp(numericValue, 1500);
  const displayValue =
    animate && typeof value === "number" ? animatedValue : value;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-3">
            {title}
          </p>
          <p className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            {displayValue}
          </p>
        </div>
        <div
          className={`${iconBgColor} dark:bg-opacity-20 p-3 rounded-lg ${iconColor} dark:brightness-125 group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
