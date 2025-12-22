import { Project } from "@/lib/types";
import Link from "next/link";
import { Calendar, FolderOpen, Trash2 } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: number) => void;
}

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

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <Link
          href={`/projects/${project.id}`}
          className="flex-1 flex items-center gap-3"
        >
          <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
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
        <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 pt-4 border-t border-slate-100">
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

      {onDelete && (
        <button
          onClick={() => onDelete(project.id)}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-md transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      )}
    </div>
  );
}
