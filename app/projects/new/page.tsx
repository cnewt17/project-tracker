"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/useToast";
import { PROJECT_STATUSES } from "@/lib/constants";
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
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";

export default function NewProjectPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    status: "Ready",
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
        toast.success("Project created successfully");
        router.push(`/projects/${project.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        {/* Back Navigation */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Create New Project
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Fill in the details to create a new project
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 border border-slate-200 dark:border-slate-700 space-y-6"
        >
          {/* Project Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <FileText className="w-4 h-4" />
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
              placeholder="Enter project name"
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <Flag className="w-4 h-4" />
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
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
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                <Calendar className="w-4 h-4" />
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <FileText className="w-4 h-4" />
              Description (Optional)
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900 resize-none"
              placeholder="Add project description..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="submit"
              disabled={submitting}
              variant="primary"
              size="lg"
              className="shadow-sm hover:shadow-md"
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
            </Button>
            <Link href="/projects">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <X className="w-5 h-5" />
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
