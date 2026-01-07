import { getRagColor, getRagLabel } from "@/lib/constants";

interface RagStatusDotProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function RagStatusDot({
  status,
  size = "md",
  showLabel = false,
}: RagStatusDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full ${getRagColor(status, "dot")}`}
      />
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {getRagLabel(status)}
        </span>
      )}
    </div>
  );
}
