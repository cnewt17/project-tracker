import { Resource } from "@/lib/types";
import Button from "./Button";

interface ResourceTableProps {
  resources: Resource[];
  onDelete?: (id: number) => void;
}

export default function ResourceTable({
  resources,
  onDelete,
}: ResourceTableProps) {
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
            {onDelete && (
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {resources.map((resource) => (
            <tr
              key={resource.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-50">
                {resource.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {resource.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                <span
                  className={
                    resource.allocation_percentage > 100
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : ""
                  }
                >
                  {resource.allocation_percentage}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {new Date(resource.start_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {resource.end_date
                  ? new Date(resource.end_date).toLocaleDateString()
                  : "-"}
              </td>
              {onDelete && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    onClick={() => onDelete(resource.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
