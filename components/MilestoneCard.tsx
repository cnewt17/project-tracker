"use client";

import { Milestone } from "@/lib/types";
import { Calendar, CheckCircle2, Clock, Flag, Trash2, Edit } from "lucide-react";
import Button from "./Button";

interface MilestoneCardProps {
  milestone: Milestone;
  onDelete?: (id: number) => void;
  onEdit?: (milestone: Milestone) => void;
  onUpdateProgress?: (id: number, progress: number) => void;
}

export default function MilestoneCard({
  milestone,
  onDelete,
  onEdit,
  onUpdateProgress,
}: MilestoneCardProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      color: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
      icon: Clock,
    },
    in_progress: {
      label: "In Progress",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      icon: Flag,
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: CheckCircle2,
    },
  };

  const config = statusConfig[milestone.status];
  const StatusIcon = config.icon;

  // Check if milestone is overdue
  const isOverdue =
    milestone.status !== "completed" &&
    new Date(milestone.due_date) < new Date();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {milestone.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
            >
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
          {milestone.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {milestone.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Due: {formatDate(milestone.due_date)}</span>
            {isOverdue && (
              <span className="text-red-600 dark:text-red-400 font-medium">
                (Overdue)
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              onClick={() => onEdit(milestone)}
              variant="ghost"
              size="sm"
              aria-label="Edit milestone"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(milestone.id)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              aria-label="Delete milestone"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Progress
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {milestone.progress}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              milestone.progress === 100
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
        {onUpdateProgress && milestone.status !== "completed" && (
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={milestone.progress}
              onChange={(e) => onUpdateProgress(milestone.id, parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
