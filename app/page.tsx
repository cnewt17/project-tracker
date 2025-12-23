"use client";

import { useEffect, useState } from "react";
import { DashboardStats, Project } from "@/lib/types";
import StatCard from "@/components/StatCard";
import ProjectCard from "@/components/ProjectCard";
import Link from "next/link";
import {
  FolderOpen,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
  BarChart3,
  Loader2,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/projects"),
      ]);

      const statsData = await statsRes.json();
      const projectsData = await projectsRes.json();

      setStats(statsData);
      setRecentProjects(projectsData.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Track your projects and resources at a glance
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

      {stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={FolderOpen}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={TrendingUp}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
            <StatCard
              title="Total Resources"
              value={stats.totalResources}
              icon={Users}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
            />
            <StatCard
              title="Over-Allocated"
              value={stats.overAllocatedResources}
              icon={AlertTriangle}
              iconColor={
                stats.overAllocatedResources > 0
                  ? "text-red-600"
                  : "text-gray-600"
              }
              iconBgColor={
                stats.overAllocatedResources > 0 ? "bg-red-100" : "bg-gray-100"
              }
            />
          </div>

          {/* Projects by Status */}
          <div className="bg-white shadow-md rounded-xl p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Projects by Status
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 hover:shadow-md transition-all">
                <p className="text-sm font-medium text-blue-700 mb-2">
                  📋 Planning
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.projectsByStatus.Planning}
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 hover:shadow-md transition-all">
                <p className="text-sm font-medium text-green-700 mb-2">
                  🚀 Active
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {stats.projectsByStatus.Active}
                </p>
              </div>
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 hover:shadow-md transition-all">
                <p className="text-sm font-medium text-amber-700 mb-2">
                  ⏸️ On Hold
                </p>
                <p className="text-3xl font-bold text-amber-900">
                  {stats.projectsByStatus["On Hold"]}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  ✅ Completed
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.projectsByStatus.Completed}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent Projects</h2>
          <Link
            href="/projects"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            View All →
          </Link>
        </div>
        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-xl p-16 border border-slate-200 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No projects yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first project to get started!
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
