"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/useToast";
import { Project } from "@/lib/types";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "Ready" as Project["status"],
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    fetchProject();
  }, [resolvedParams.id]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setFormData({
          name: data.name,
          status: data.status,
          start_date: data.start_date,
          end_date: data.end_date || "",
          description: data.description || "",
        });
      } else {
        router.push("/projects");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          status: formData.status,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          description: formData.description || null,
        }),
      });

      if (res.ok) {
        toast.success("Project updated successfully");
        router.push(`/projects/${resolvedParams.id}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-slate-600 dark:text-slate-400">
        Project not found
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Navigation */}
        <Link
          href={`/projects/${resolvedParams.id}`}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </Link>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 border border-slate-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Edit Project
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Status *
              </label>
              <select
                id="status"
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Project["status"],
                  })
                }
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
              >
                <option value="Completed">✅ Completed</option>
                <option value="Active">🚀 Active</option>
                <option value="Blocked">🚫 Blocked</option>
                <option value="Ready">✔️ Ready</option>
                <option value="Pending Sale Confirmation">
                  ⏳ Pending Sale Confirmation
                </option>
                <option value="Cancelled">❌ Cancelled</option>
                <option value="Sales Pipeline">📊 Sales Pipeline</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  required
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                placeholder="Enter project description"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </Button>
              <Link href={`/projects/${resolvedParams.id}`} className="flex-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
