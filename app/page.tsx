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
  Download,
  Search,
  Archive,
  FileDown,
} from "lucide-react";
import Button from "@/components/Button";
import PageTransition from "@/components/PageTransition";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";
import { generateProjectReportHTML } from "@/lib/generateProjectReport";
import { useToast } from "@/lib/useToast";
import UtilizationChart from "@/components/UtilizationChart";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const toast = useToast();

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

  async function exportProjectsToCSV() {
    try {
      const res = await fetch("/api/projects");
      const projects = await res.json();

      // Create CSV content
      const headers = [
        "ID",
        "Name",
        "Status",
        "Start Date",
        "End Date",
        "Description",
        "Milestones",
      ];
      const rows = projects.map((project: any) => [
        project.id,
        `"${project.name}"`,
        project.status,
        project.start_date,
        project.end_date || "",
        `"${project.description || ""}"`,
        project.milestoneStats
          ? `${project.milestoneStats.completed}/${project.milestoneStats.total}`
          : "0/0",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row: any[]) => row.join(",")),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projects-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting projects:", error);
      alert("Failed to export projects");
    }
  }

  async function exportProjectReport() {
    setIsGeneratingReport(true);

    try {
      // Fetch report data
      const res = await fetch("/api/reports/projects");
      if (!res.ok) throw new Error("Failed to fetch report data");

      const data = await res.json();

      // Generate HTML
      const html = generateProjectReportHTML(data);

      // Create blob and download
      const blob = new Blob([html], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-report-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Track your projects at a glance
              </p>
            </div>
            <Link href="/projects/new">
              <Button
                variant="primary"
                size="lg"
                className="shadow-sm hover:shadow-md"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Project
                </span>
              </Button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/projects">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-slate-300 dark:border-slate-600"
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="w-4 h-4" />
                    Browse Projects
                  </span>
                </Button>
              </Link>
              <Button
                onClick={exportProjectsToCSV}
                variant="ghost"
                size="sm"
                className="border border-slate-300 dark:border-slate-600"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  Export to CSV
                </span>
              </Button>
              <Button
                onClick={exportProjectReport}
                variant="ghost"
                size="sm"
                disabled={isGeneratingReport}
                className="border border-slate-300 dark:border-slate-600"
              >
                <span className="flex items-center gap-1.5">
                  {isGeneratingReport ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  Export HTML Report
                </span>
              </Button>
              <Link href="/projects?archived=true">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-slate-300 dark:border-slate-600"
                >
                  <span className="flex items-center gap-1.5">
                    <Archive className="w-4 h-4" />
                    View Archived
                  </span>
                </Button>
              </Link>
            </div>
          </div>
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
                title="Total People"
                value={stats.totalResources}
                icon={Users}
                iconColor="text-purple-600"
                iconBgColor="bg-purple-100"
              />
              <StatCard
                title="People Over-Allocated"
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

            {/* Team Utilization Chart */}
            <UtilizationChart />

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-2">
                    ✅ Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-300">
                    {stats.projectsByStatus.Completed}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">
                    🚀 Active
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                    {stats.projectsByStatus.Active}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 hover:shadow-md transition-all">
                  <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-2">
                    🚫 Blocked
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                    {stats.projectsByStatus.Blocked}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                    ✔️ Ready
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {stats.projectsByStatus.Ready}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">
                    ⏳ Pending Sale
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                    {stats.projectsByStatus["Pending Sale Confirmation"]}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-400 mb-2">
                    ❌ Cancelled
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-300">
                    {stats.projectsByStatus.Cancelled}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-2">
                    📊 Sales Pipeline
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                    {stats.projectsByStatus["Sales Pipeline"]}
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
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Project
                  </span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
