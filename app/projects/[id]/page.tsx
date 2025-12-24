"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project, Resource, Milestone } from "@/lib/types";
import ResourceTable from "@/components/ResourceTable";
import MilestoneCard from "@/components/MilestoneCard";
import MilestoneForm from "@/components/MilestoneForm";
import Link from "next/link";
import { use } from "react";
import {
  ArrowLeft,
  Plus,
  Users,
  Calendar,
  FileText,
  Loader2,
  X,
  Flag,
  Edit,
  Archive,
  ArchiveRestore,
  Copy,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";

const statusColors = {
  Planning: "bg-blue-100 text-blue-700 border-blue-200",
  Active: "bg-green-100 text-green-700 border-green-200",
  "On Hold": "bg-amber-100 text-amber-700 border-amber-200",
  Completed: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusIcons = {
  Planning: "📋",
  Active: "🚀",
  "On Hold": "⏸️",
  Completed: "✅",
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<
    (Project & { resources: Resource[]; milestones: Milestone[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [resourceFormData, setResourceFormData] = useState({
    name: "",
    type: "Developer",
    allocation_percentage: "",
    start_date: "",
    end_date: "",
  });
  const [allocationWarning, setAllocationWarning] = useState<string>("");

  useEffect(() => {
    fetchProject();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (resourceFormData.name && resourceFormData.allocation_percentage) {
      checkResourceAllocation(
        resourceFormData.name,
        parseFloat(resourceFormData.allocation_percentage),
      );
    } else {
      setAllocationWarning("");
    }
  }, [resourceFormData.name, resourceFormData.allocation_percentage]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
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

  async function handleDeleteResource(resourceId: number) {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProject();
      } else {
        alert("Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert("Failed to delete resource");
    }
  }

  async function handleEditResource(
    resourceId: number,
    data: Partial<Resource>,
  ) {
    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        fetchProject();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update resource");
      }
    } catch (error) {
      console.error("Error updating resource:", error);
      alert("Failed to update resource");
    }
  }

  async function checkResourceAllocation(name: string, newAllocation: number) {
    if (!name || !newAllocation) {
      setAllocationWarning("");
      return;
    }

    try {
      const res = await fetch("/api/resources/allocation");
      if (res.ok) {
        const data = await res.json();
        const resourceAllocation = data.find((item: any) => item.name === name);

        if (resourceAllocation) {
          const totalAllocation =
            resourceAllocation.total_allocation + newAllocation;
          if (totalAllocation > 100) {
            setAllocationWarning(
              `Warning: ${name} will be ${totalAllocation}% allocated across all projects (currently ${resourceAllocation.total_allocation}%)`,
            );
          } else {
            setAllocationWarning("");
          }
        } else {
          setAllocationWarning("");
        }
      }
    } catch (error) {
      console.error("Error checking allocation:", error);
    }
  }

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: parseInt(resolvedParams.id),
          name: resourceFormData.name,
          type: resourceFormData.type,
          allocation_percentage: parseFloat(
            resourceFormData.allocation_percentage,
          ),
          start_date: resourceFormData.start_date,
          end_date: resourceFormData.end_date || null,
        }),
      });

      if (res.ok) {
        setShowResourceForm(false);
        setResourceFormData({
          name: "",
          type: "Developer",
          allocation_percentage: "",
          start_date: "",
          end_date: "",
        });
        fetchProject();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add resource");
      }
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Failed to add resource");
    }
  }

  async function handleSubmitMilestone(data: any) {
    try {
      if (editingMilestone) {
        const res = await fetch(`/api/milestones/${editingMilestone.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          setShowMilestoneForm(false);
          setEditingMilestone(null);
          fetchProject();
        } else {
          const error = await res.json();
          alert(error.error || "Failed to update milestone");
        }
      } else {
        const res = await fetch("/api/milestones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          setShowMilestoneForm(false);
          fetchProject();
        } else {
          const error = await res.json();
          alert(error.error || "Failed to create milestone");
        }
      }
    } catch (error) {
      console.error("Error with milestone:", error);
      alert("Failed to save milestone");
    }
  }

  async function handleDeleteMilestone(milestoneId: number) {
    if (!confirm("Are you sure you want to delete this milestone?")) {
      return;
    }

    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProject();
      } else {
        alert("Failed to delete milestone");
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
      alert("Failed to delete milestone");
    }
  }

  async function handleUpdateProgress(milestoneId: number, progress: number) {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });

      if (res.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  }

  function handleEditMilestone(milestone: Milestone) {
    setEditingMilestone(milestone);
    setShowMilestoneForm(true);
  }

  function handleCancelMilestoneForm() {
    setShowMilestoneForm(false);
    setEditingMilestone(null);
  }

  async function handleArchiveToggle() {
    const action = project?.archived ? "unarchive" : "archive";
    if (!confirm(`Are you sure you want to ${action} this project?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}/archive`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !project?.archived }),
      });

      if (res.ok) {
        fetchProject();
      } else {
        alert(`Failed to ${action} project`);
      }
    } catch (error) {
      console.error(`Error ${action}ing project:`, error);
      alert(`Failed to ${action} project`);
    }
  }

  async function handleDuplicate() {
    if (
      !confirm(
        "Duplicate this project? This will copy all resources and milestones.",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}/duplicate`, {
        method: "POST",
      });

      if (res.ok) {
        const newProject = await res.json();
        router.push(`/projects/${newProject.id}`);
      } else {
        alert("Failed to duplicate project");
      }
    } catch (error) {
      console.error("Error duplicating project:", error);
      alert("Failed to duplicate project");
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
      <div className="space-y-8">
        {/* Back Navigation */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Project Header Card */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {project.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[project.status]} flex items-center gap-1`}
                >
                  <span>{statusIcons[project.status]}</span>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/projects/${project.id}/edit`}>
                <Button variant="secondary" size="sm" className="shadow-sm">
                  <span className="flex items-center gap-1.5">
                    <Edit className="w-4 h-4" />
                    Edit
                  </span>
                </Button>
              </Link>
              <Button
                onClick={handleDuplicate}
                variant="ghost"
                size="sm"
                className="shadow-sm border border-slate-300 dark:border-slate-600"
              >
                <span className="flex items-center gap-1.5">
                  <Copy className="w-4 h-4" />
                  Duplicate
                </span>
              </Button>
              <Button
                onClick={handleArchiveToggle}
                variant="ghost"
                size="sm"
                className="shadow-sm border border-slate-300 dark:border-slate-600"
              >
                {project.archived ? (
                  <span className="flex items-center gap-1.5">
                    <ArchiveRestore className="w-4 h-4" />
                    Unarchive
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Archive className="w-4 h-4" />
                    Archive
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Start Date
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {new Date(project.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            {project.end_date && (
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    End Date
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {new Date(project.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resources Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Project team
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {project.resources.length} assigned
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowResourceForm(!showResourceForm)}
              variant="primary"
              size="lg"
              className="shadow-sm hover:shadow-md"
            >
              {showResourceForm ? (
                <span className="flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Cancel
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Resource
                </span>
              )}
            </Button>
          </div>

          {showResourceForm && (
            <form
              onSubmit={handleAddResource}
              className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Add New Resource
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Resource Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={resourceFormData.name}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={resourceFormData.type}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        type: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                    placeholder="e.g., Developer, Designer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Allocation % *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={resourceFormData.allocation_percentage}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        allocation_percentage: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                    placeholder="50"
                  />
                  {allocationWarning && (
                    <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        {allocationWarning}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={resourceFormData.start_date}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={resourceFormData.end_date}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="md">
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Resource
                </span>
              </Button>
            </form>
          )}

          <ResourceTable
            resources={project.resources}
            onDelete={handleDeleteResource}
            onEdit={handleEditResource}
          />
        </div>

        {/* Milestones Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <Flag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Milestones
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {project.milestones?.length || 0} milestone
                  {project.milestones?.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingMilestone(null);
                setShowMilestoneForm(!showMilestoneForm);
              }}
              variant="primary"
              size="lg"
              className="shadow-sm hover:shadow-md"
            >
              {showMilestoneForm ? (
                <span className="flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Cancel
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Milestone
                </span>
              )}
            </Button>
          </div>

          {showMilestoneForm && (
            <div className="mb-6">
              <MilestoneForm
                projectId={parseInt(resolvedParams.id)}
                milestone={editingMilestone || undefined}
                onSubmit={handleSubmitMilestone}
                onCancel={handleCancelMilestoneForm}
              />
            </div>
          )}

          {project.milestones && project.milestones.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {project.milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onDelete={handleDeleteMilestone}
                  onEdit={handleEditMilestone}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-12 border border-slate-200 dark:border-slate-700 text-center">
              <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                No milestones yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Add milestones to track important deadlines and goals for this
                project
              </p>
              <Button
                onClick={() => setShowMilestoneForm(true)}
                variant="primary"
                size="md"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add First Milestone
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
