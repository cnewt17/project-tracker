"use client";

import React, { useEffect, useState } from "react";
import { ResourceAllocation } from "@/lib/types";
import { formatDateUK } from "@/lib/dateUtils";
import StatCard from "@/components/StatCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Search,
  FolderOpen,
  TrendingUp,
} from "lucide-react";
import { getStatusColor, getStatusIcon } from "@/lib/constants";

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const res = await fetch("/api/resources/allocation");
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter resources based on search
  const filteredResources = resources.filter((resource) => {
    return resource.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate statistics
  const stats = {
    totalResources: resources.length,
    overAllocated: resources.filter((r) => r.is_over_allocated).length,
    totalProjects: new Set(
      resources.flatMap((r) => r.projects.map((p) => p.project_id)),
    ).size,
    avgAllocation:
      resources.length > 0
        ? (
            resources.reduce((sum, r) => sum + r.current_allocation, 0) /
            resources.length
          ).toFixed(1)
        : "0.0",
  };

  function toggleRow(resourceName: string) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(resourceName)) {
      newExpanded.delete(resourceName);
    } else {
      newExpanded.add(resourceName);
    }
    setExpandedRows(newExpanded);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Loading resources...
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Resource Allocation
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View total resource allocation across all projects
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Resources"
            value={stats.totalResources}
            icon={Users}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-900/20"
          />
          <StatCard
            title="Over-Allocated"
            value={stats.overAllocated}
            icon={AlertCircle}
            iconColor={
              stats.overAllocated > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }
            iconBgColor={
              stats.overAllocated > 0
                ? "bg-red-100 dark:bg-red-900/20"
                : "bg-green-100 dark:bg-green-900/20"
            }
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FolderOpen}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBgColor="bg-purple-100 dark:bg-purple-900/20"
          />
          <StatCard
            title="Avg Allocation"
            value={`${stats.avgAllocation}%`}
            icon={TrendingUp}
            iconColor="text-green-600 dark:text-green-400"
            iconBgColor="bg-green-100 dark:bg-green-900/20"
          />
        </div>

        {/* Search Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by resource name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
        </div>

        {/* Resources Table */}
        {filteredResources.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-12 border border-slate-200 dark:border-slate-700 text-center">
            <div className="bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {searchQuery ? "No resources found" : "No resources yet"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : "Add resources to projects to see them here"}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Resource Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type(s)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Current Allocation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date Range
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredResources.map((resource) => {
                    const isExpanded = expandedRows.has(resource.name);
                    const hasProjects = resource.projects.length > 0;

                    return (
                      <React.Fragment key={resource.name}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {hasProjects && (
                                <button
                                  onClick={() => toggleRow(resource.name)}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                  aria-label={
                                    isExpanded
                                      ? "Collapse projects"
                                      : "Expand projects"
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                {resource.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {resource.types}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  resource.is_over_allocated
                                    ? "text-red-600 dark:text-red-400"
                                    : resource.current_allocation === 0
                                      ? "text-slate-500 dark:text-slate-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {resource.current_allocation}%
                              </span>
                              {resource.is_over_allocated && (
                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasProjects ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {resource.project_count}{" "}
                                {resource.project_count === 1
                                  ? "project"
                                  : "projects"}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-500 dark:text-slate-400 italic">
                                No projects
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {resource.earliest_start && resource.latest_end ? (
                              <>
                                {formatDateUK(resource.earliest_start)} →{" "}
                                {formatDateUK(resource.latest_end)}
                              </>
                            ) : (
                              <span className="italic">N/A</span>
                            )}
                          </td>
                        </tr>

                        {/* Expanded Project Details */}
                        {isExpanded && hasProjects && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50"
                            >
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                                  Project Assignments
                                </h4>
                                <div className="grid gap-2">
                                  {resource.projects.map((project) => (
                                    <div
                                      key={project.project_id}
                                      className={`flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 border ${
                                        project.is_active
                                          ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10"
                                          : "border-slate-200 dark:border-slate-700 opacity-60"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <Link
                                          href={`/projects/${project.project_id}`}
                                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                          {project.project_name}
                                        </Link>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(project.project_status as any, "light")}`}
                                        >
                                          <span className="flex items-center gap-1">
                                            <span>
                                              {getStatusIcon(
                                                project.project_status as any,
                                              )}
                                            </span>
                                            {project.project_status}
                                          </span>
                                        </span>
                                        {project.is_active && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-semibold">
                                          {project.allocation}%
                                        </span>
                                        <span>
                                          {formatDateUK(project.start_date)} →{" "}
                                          {project.end_date
                                            ? formatDateUK(project.end_date)
                                            : "Ongoing"}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
