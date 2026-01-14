"use client";

import { useState, useEffect } from "react";
import { Milestone } from "@/lib/types";
import Button from "./Button";
import { X } from "lucide-react";

interface MilestoneFormProps {
  projectId: number;
  milestone?: Milestone;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export default function MilestoneForm({
  projectId,
  milestone,
  onSubmit,
  onCancel,
}: MilestoneFormProps) {
  const [formData, setFormData] = useState({
    name: milestone?.name || "",
    description: milestone?.description || "",
    due_date: milestone?.due_date || "",
    baseline_due_date: milestone?.baseline_due_date || "",
    status: milestone?.status || "pending",
    progress: milestone?.progress || 0,
    jira_key: milestone?.jira_key || "",
  });

  useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name,
        description: milestone.description || "",
        due_date: milestone.due_date,
        baseline_due_date: milestone.baseline_due_date || "",
        status: milestone.status,
        progress: milestone.progress,
        jira_key: milestone.jira_key || "",
      });
    }
  }, [milestone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      project_id: projectId,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value) : value,
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          {milestone ? "Edit Milestone" : "New Milestone"}
        </h3>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Milestone Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            placeholder="Enter milestone name"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            placeholder="Enter milestone description"
          />
        </div>

        <div>
          <label
            htmlFor="jira_key"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Jira Task Key (Optional)
          </label>
          <input
            type="text"
            id="jira_key"
            name="jira_key"
            value={formData.jira_key}
            onChange={(e) => {
              const { value } = e.target;
              setFormData((prev) => ({
                ...prev,
                jira_key: value.toUpperCase(),
              }));
            }}
            pattern="[A-Z][A-Z0-9]+-[0-9]+"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-mono"
            placeholder="e.g., PROJ-123"
            title="Format: PROJ-123"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Format: PROJECT-123
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Due Date *
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="baseline_due_date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Baseline Due Date (Optional)
            </label>
            <input
              type="date"
              id="baseline_due_date"
              name="baseline_due_date"
              value={formData.baseline_due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="progress"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Progress: {formData.progress}%
          </label>
          <input
            type="range"
            id="progress"
            name="progress"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${formData.progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            {milestone ? "Update Milestone" : "Create Milestone"}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
