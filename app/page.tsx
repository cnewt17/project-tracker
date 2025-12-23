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
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";

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
        <p className="text-slate-600 dark:text-slate-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track your projects and resources at a glance
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

        {stats && (
          <>
            {/* Stats Grid */}
            <StaggeredFadeIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  stats.overAllocatedResources > 0
                    ? "bg-red-100"
                    : "bg-gray-100"
                }
              />
            </StaggeredFadeIn>

            {/* Projects by Status */}
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Projects by Status
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                    📋 Planning
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                    {stats.projectsByStatus.Planning}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                    🚀 Active
                  </p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                    {stats.projectsByStatus.Active}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                    ⏸️ On Hold
                  </p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-300">
                    {stats.projectsByStatus["On Hold"]}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    ✅ Completed
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-300">
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Recent Projects
            </h2>
            <Link
              href="/projects"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline"
            >
              View All →
            </Link>
          </div>
          {recentProjects.length > 0 ? (
            <StaggeredFadeIn className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </StaggeredFadeIn>
          ) : (
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-16 border border-slate-200 dark:border-slate-700 text-center">
              <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first project to get started!
              </p>
              <Link href="/projects/new">
                <Button variant="primary" size="md">
                  <Plus className="w-5 h-5" />
                  Create Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
