"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  FileText,
  Calendar,
  Flag,
  Loader2,
} from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    status: "Planning",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          end_date: formData.end_date || null,
          description: formData.description || null,
        }),
      });

      if (res.ok) {
        const project = await res.json();
        router.push(`/projects/${project.id}`);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Navigation */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Create New Project
        </h1>
        <p className="text-slate-600">
          Fill in the details to create a new project
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-8 border border-slate-200 space-y-6"
      >
        {/* Project Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <FileText className="w-4 h-4" />
            Project Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            placeholder="Enter project name"
          />
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Flag className="w-4 h-4" />
            Status *
          </label>
          <select
            required
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-white"
          >
            <option value="Planning">📋 Planning</option>
            <option value="Active">🚀 Active</option>
            <option value="On Hold">⏸️ On Hold</option>
            <option value="Completed">✅ Completed</option>
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Calendar className="w-4 h-4" />
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Calendar className="w-4 h-4" />
              End Date (Optional)
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <FileText className="w-4 h-4" />
            Description (Optional)
          </label>
          <textarea
            rows={5}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 resize-none"
            placeholder="Add project description..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Project
              </>
            )}
          </button>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-8 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            <X className="w-5 h-5" />
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
