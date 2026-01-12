"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import type { UtilizationAPIResponse, UtilizationChartData } from "@/lib/types";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: UtilizationChartData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {data.weekLabel} ({data.week})
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Utilization:</span>{" "}
            {data.utilization.toFixed(2)}%
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Capacity:</span>{" "}
            {data.capacity.toFixed(0)}%
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Allocated:</span>{" "}
            {data.allocated.toFixed(0)}%
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Resources:</span> {data.resourceCount}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export default function UtilizationChart() {
  const [data, setData] = useState<UtilizationAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/utilization/weekly");
      if (!response.ok) {
        throw new Error("Failed to fetch utilization data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching utilization data:", err);
      setError("Failed to load utilization data");
    } finally {
      setLoading(false);
    }
  }

  async function captureSnapshot() {
    try {
      setCapturing(true);
      setError(null);
      const response = await fetch("/api/utilization/weekly", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to capture snapshot");
      }
      await fetchData();
    } catch (err) {
      console.error("Error capturing snapshot:", err);
      setError("Failed to capture snapshot");
    } finally {
      setCapturing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 dark:text-gray-400">
            Loading utilization data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const hasData = data && data.data.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Team Utilisation
        </h2>
        <button
          onClick={captureSnapshot}
          disabled={capturing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {capturing ? "Capturing..." : "Capture This Week"}
        </button>
      </div>

      {hasData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Average Utilization
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(data.summary.averageUtilization)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Current Week
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.currentWeekUtilization !== null
                  ? `${Math.round(data.summary.currentWeekUtilization)}%`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Weeks Tracked
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.weeksTracked}
              </p>
            </div>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-300 dark:stroke-gray-600"
                />
                <XAxis
                  dataKey="weekLabel"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  label={{
                    value: "Utilization %",
                    angle: -90,
                    position: "insideLeft",
                    className: "text-gray-600 dark:text-gray-400",
                  }}
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="utilization"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <svg
            className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No utilization data yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click the button above to capture your first weekly snapshot
          </p>
        </div>
      )}
    </div>
  );
}
