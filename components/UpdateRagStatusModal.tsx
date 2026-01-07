"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import RagStatusDot from "./RagStatusDot";
import { RAG_STATUSES } from "@/lib/constants";

interface UpdateRagStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ragStatus: string, comment: string) => void;
  currentStatus: string;
  projectName: string;
}

export default function UpdateRagStatusModal({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  projectName,
}: UpdateRagStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [comment, setComment] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
      setComment("");
    }
  }, [isOpen, currentStatus]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedStatus, comment);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Update RAG Status
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Status
            </label>
            <div className="space-y-2">
              {RAG_STATUSES.map((status) => (
                <label
                  key={status.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedStatus === status.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="rag_status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="sr-only"
                  />
                  <RagStatusDot status={status.value} size="lg" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Comment (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment about this status update..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg
                       bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Status
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
