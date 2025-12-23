"use client";

import { useEffect, useState } from "react";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import { Plus, Filter, Loader2, FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Projects</h1>
          <p className="text-slate-600">
            Manage all your projects in one place
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md font-medium"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Filter className="w-5 h-5" />
            <label className="text-sm font-medium">Filter by status:</label>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="Planning">📋 Planning</option>
            <option value="Active">🚀 Active</option>
            <option value="On Hold">⏸️ On Hold</option>
            <option value="Completed">✅ Completed</option>
          </select>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-200">
              <FolderOpen className="w-4 h-4" />
              {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-16 border border-slate-200 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No projects found
          </h3>
          <p className="text-slate-600 mb-6">
            {statusFilter !== "all"
              ? `No projects with status "${statusFilter}". Try changing the filter.`
              : "Get started by creating your first project!"}
          </p>
          {statusFilter !== "all" ? (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Clear Filter
            </button>
          ) : (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
