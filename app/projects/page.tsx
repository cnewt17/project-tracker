"use client";

import { useEffect, useState } from "react";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import { Plus, Filter, Loader2, FolderOpen } from "lucide-react";
import { SkeletonCard } from "@/components/Skeleton";
import ConfirmModal from "@/components/ConfirmModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/lib/useToast";
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    projectId: number | null;
  }>({
    isOpen: false,
    projectId: null,
  });
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter((p) => p.status === statusFilter));
    }
  }, [statusFilter, projects]);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        toast.success("Project deleted successfully");
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  }

  const statusBadges = [
    {
      value: "Planning",
      label: "📋 Planning",
      color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    },
    {
      value: "Active",
      label: "🚀 Active",
      color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
    },
    {
      value: "On Hold",
      label: "⏸️ On Hold",
      color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
    },
    {
      value: "Completed",
      label: "✅ Completed",
      color: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-shimmer mb-2" />
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, projectId: null })}
        onConfirm={() => {
          if (deleteModal.projectId) {
            handleDelete(deleteModal.projectId);
          }
        }}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and will also delete all associated resources."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Projects
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage all your projects in one place
            </p>
          </div>
          <Link href="/projects/new">
            <Button
              variant="primary"
              size="lg"
              className="shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Filter Bar with Clickable Status Badges */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-4">
            <Filter className="w-5 h-5" />
            <label className="text-sm font-medium">Filter by status:</label>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setStatusFilter("all")}
              variant={statusFilter === "all" ? "primary" : "secondary"}
              size="sm"
              className={statusFilter === "all" ? "shadow-md" : ""}
            >
              All Statuses
            </Button>
            {statusBadges.map((badge) => (
              <Button
                key={badge.value}
                onClick={() => setStatusFilter(badge.value)}
                variant="ghost"
                size="sm"
                className={`border ${
                  statusFilter === badge.value
                    ? `${badge.color} shadow-md ring-2 ring-offset-2 ${badge.value === "Planning" ? "ring-blue-300" : badge.value === "Active" ? "ring-green-300" : badge.value === "On Hold" ? "ring-amber-300" : "ring-gray-300"}`
                    : badge.color
                }`}
              >
                {badge.label}
              </Button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <FolderOpen className="w-4 h-4" />
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {filteredProjects.length}
              </span>{" "}
              project
              {filteredProjects.length !== 1 ? "s" : ""}{" "}
              {statusFilter !== "all" && `with status "${statusFilter}"`}
            </span>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <StaggeredFadeIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={(id) =>
                  setDeleteModal({ isOpen: true, projectId: id })
                }
              />
            ))}
          </StaggeredFadeIn>
        ) : (
          <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-16 border border-slate-200 dark:border-slate-700 text-center">
            <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              No projects found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {statusFilter !== "all"
                ? `No projects with status "${statusFilter}". Try changing the filter.`
                : "Get started by creating your first project!"}
            </p>
            {statusFilter !== "all" ? (
              <Button
                onClick={() => setStatusFilter("all")}
                variant="ghost"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Clear Filter
              </Button>
            ) : (
              <Link href="/projects/new">
                <Button variant="primary" size="md">
                  <Plus className="w-5 h-5" />
                  Create Project
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
