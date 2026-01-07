"use client";

import { useState } from "react";
import { ProjectStatusUpdate } from "@/lib/types";
import { getRagColor, getRagLabel } from "@/lib/constants";
import RagStatusDot from "./RagStatusDot";

interface RagStatusTimelineProps {
  updates: ProjectStatusUpdate[];
}

export default function RagStatusTimeline({
  updates,
}: RagStatusTimelineProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<ProjectStatusUpdate | null>(
    updates.length > 0 ? updates[0] : null,
  );

  if (updates.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        No status updates yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />

        {/* Dots */}
        <div className="relative flex justify-between items-center">
          {updates.map((update) => (
            <button
              key={update.id}
              onClick={() => setSelectedUpdate(update)}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                ${getRagColor(update.rag_status, "timeline")}
                ${selectedUpdate?.id === update.id ? "ring-4" : "ring-2"}
                transition-all hover:scale-110 focus:outline-none focus:ring-4`}
            >
              <div className="w-3 h-3 bg-white dark:bg-slate-900 rounded-full" />
            </button>
          ))}
        </div>

        {/* Dates below dots */}
        <div className="flex justify-between mt-2">
          {updates.map((update) => (
            <div
              key={update.id}
              className="text-xs text-slate-500 dark:text-slate-400 text-center"
            >
              {new Date(update.created_at).toLocaleDateString()}
            </div>
          ))}
        </div>
      </div>

      {/* Selected update comment */}
      {selectedUpdate && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <RagStatusDot status={selectedUpdate.rag_status} size="sm" />
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              {getRagLabel(selectedUpdate.rag_status)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {new Date(selectedUpdate.created_at).toLocaleString()}
            </span>
          </div>
          {selectedUpdate.comment && (
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              {selectedUpdate.comment}
            </p>
          )}
          {!selectedUpdate.comment && (
            <p className="text-slate-400 dark:text-slate-500 text-sm italic">
              No comment provided
            </p>
          )}
        </div>
      )}
    </div>
  );
}
