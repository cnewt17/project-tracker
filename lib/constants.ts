import { Project } from "./types";

/**
 * Project status configuration
 * Centralized source of truth for all project statuses across the application
 */
export const PROJECT_STATUSES = [
  {
    value: "Completed" as const,
    label: "Completed",
    icon: "✅",
    color: {
      light:
        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700",
      badge:
        "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700",
    },
  },
  {
    value: "Active" as const,
    label: "Active",
    icon: "🚀",
    color: {
      light:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
      badge:
        "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    },
  },
  {
    value: "Blocked" as const,
    label: "Blocked",
    icon: "🚫",
    color: {
      light:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
      badge:
        "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    },
  },
  {
    value: "Ready" as const,
    label: "Ready",
    icon: "✔️",
    color: {
      light:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
      badge:
        "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    },
  },
  {
    value: "Pending Sale Confirmation" as const,
    label: "Pending Sale Confirmation",
    icon: "⏳",
    color: {
      light:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
      badge:
        "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    },
  },
  {
    value: "Cancelled" as const,
    label: "Cancelled",
    icon: "❌",
    color: {
      light:
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-700",
      badge:
        "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-700",
    },
  },
  {
    value: "Sales Pipeline" as const,
    label: "Sales Pipeline",
    icon: "📊",
    color: {
      light:
        "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
      badge:
        "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
    },
  },
] as const;

/**
 * Get the color classes for a status
 */
export function getStatusColor(
  status: Project["status"],
  variant: "light" | "badge" = "light",
): string {
  const statusConfig = PROJECT_STATUSES.find((s) => s.value === status);
  return statusConfig?.color[variant] || "";
}

/**
 * Get the icon for a status
 */
export function getStatusIcon(status: Project["status"]): string {
  const statusConfig = PROJECT_STATUSES.find((s) => s.value === status);
  return statusConfig?.icon || "";
}

/**
 * Get the label for a status
 */
export function getStatusLabel(status: Project["status"]): string {
  const statusConfig = PROJECT_STATUSES.find((s) => s.value === status);
  return statusConfig?.label || status;
}

/**
 * Get full status configuration
 */
export function getStatusConfig(status: Project["status"]) {
  return PROJECT_STATUSES.find((s) => s.value === status);
}
