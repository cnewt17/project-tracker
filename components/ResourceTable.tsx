"use client";

import { Resource } from "@/lib/types";
import Button from "./Button";
import { useState, useEffect } from "react";
import { Edit, Save, X, AlertCircle } from "lucide-react";

interface ResourceTableProps {
  resources: Resource[];
  onDelete?: (id: number) => void;
  onEdit?: (id: number, data: Partial<Resource>) => void;
}

export default function ResourceTable({
  resources,
  onDelete,
  onEdit,
}: ResourceTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Resource>>({});
  const [allocations, setAllocations] = useState<
    Record<string, { total_allocation: number; project_count: number }>
  >({});

  useEffect(() => {
    fetchAllocations();
  }, []);

  async function fetchAllocations() {
    try {
      const res = await fetch("/api/resources/allocation");
      if (res.ok) {
        const data = await res.json();
        const allocationMap: Record<
          string,
          { total_allocation: number; project_count: number }
        > = {};
        data.forEach((item: any) => {
          allocationMap[item.name] = {
            total_allocation: item.total_allocation,
            project_count: item.project_count,
          };
        });
        setAllocations(allocationMap);
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setEditData({
      name: resource.name,
      type: resource.type,
      allocation_percentage: resource.allocation_percentage,
      start_date: resource.start_date,
      end_date: resource.end_date,
    });
  };

  const handleSave = (id: number) => {
    if (onEdit) {
      onEdit(id, editData);
    }
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  if (resources.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
        No resources assigned yet.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Allocation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              End Date
            </th>
            {(onDelete || onEdit) && (
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {resources.map((resource) => {
            const isEditing = editingId === resource.id;

            return (
              <tr
                key={resource.id}
                className={
                  isEditing
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700"
                }
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-50">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{resource.name}</span>
                      {allocations[resource.name] &&
                        allocations[resource.name].project_count > 1 && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              allocations[resource.name].total_allocation > 100
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                            title={`Assigned to ${allocations[resource.name].project_count} projects`}
                          >
                            {allocations[resource.name].total_allocation >
                              100 && <AlertCircle className="w-3 h-3" />}
                            {allocations[resource.name].total_allocation}% total
                          </span>
                        )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.type || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, type: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900"
                    />
                  ) : (
                    resource.type
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editData.allocation_percentage || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          allocation_percentage: parseFloat(e.target.value),
                        })
                      }
                      className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900"
                    />
                  ) : (
                    <span
                      className={
                        resource.allocation_percentage > 100
                          ? "text-red-600 dark:text-red-400 font-semibold"
                          : ""
                      }
                    >
                      {resource.allocation_percentage}%
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.start_date || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, start_date: e.target.value })
                      }
                      className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900"
                    />
                  ) : (
                    new Date(resource.start_date).toLocaleDateString()
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.end_date || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, end_date: e.target.value })
                      }
                      className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900"
                    />
                  ) : resource.end_date ? (
                    new Date(resource.end_date).toLocaleDateString()
                  ) : (
                    "-"
                  )}
                </td>
                {(onDelete || onEdit) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={() => handleSave(resource.id)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {onEdit && (
                            <Button
                              onClick={() => handleEdit(resource)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              onClick={() => onDelete(resource.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
