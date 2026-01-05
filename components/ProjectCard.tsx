import { Project } from "@/lib/types";
import Link from "next/link";
import { Calendar, FolderOpen, Trash2, Flag } from "lucide-react";
import Button from "./Button";

interface ProjectCardProps {
  project: Project & {
    milestoneStats?: {
      total: number;
      completed: number;
    };
  };
  onDelete?: (id: number) => void;
}

const statusColors = {
  Completed:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700",
  Active:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  Blocked:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  Ready:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  "Pending Sale Confirmation":
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  Cancelled:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-700",
  "Sales Pipeline":
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
};

const statusIcons = {
  Completed: "✅",
  Active: "🚀",
  Blocked: "🚫",
  Ready: "✔️",
  "Pending Sale Confirmation": "⏳",
  Cancelled: "❌",
  "Sales Pipeline": "📊",
};

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <Link
          href={`/projects/${project.id}`}
          className="flex-1 flex items-center gap-3"
        >
          <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
          </div>
        </Link>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[project.status]} flex items-center gap-1 whitespace-nowrap ml-3`}
        >
          <span>{statusIcons[project.status]}</span>
          {project.status}
        </span>
      </div>

      {project.description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(project.start_date).toLocaleDateString()}</span>
        </div>
        {project.end_date && (
          <>
            <span>→</span>
            <span>{new Date(project.end_date).toLocaleDateString()}</span>
          </>
        )}
      </div>

      {/* Milestone Progress */}
      {project.milestoneStats && project.milestoneStats.total > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Flag className="w-4 h-4 text-blue-500" />
              <span className="font-medium">
                {project.milestoneStats.completed} /{" "}
                {project.milestoneStats.total} milestones
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {Math.round(
                (project.milestoneStats.completed /
                  project.milestoneStats.total) *
                  100,
              )}
              %
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                project.milestoneStats.completed ===
                project.milestoneStats.total
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
              style={{
                width: `${(project.milestoneStats.completed / project.milestoneStats.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {onDelete && (
        <Button
          onClick={() => onDelete(project.id)}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      )}
    </div>
  );
}
