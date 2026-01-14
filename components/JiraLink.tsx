"use client";

import { ExternalLink } from "lucide-react";
import { getJiraUrl } from "@/lib/config";

interface JiraLinkProps {
  jiraKey: string | null;
  className?: string;
}

export default function JiraLink({ jiraKey, className = "" }: JiraLinkProps) {
  if (!jiraKey) return null;

  const url = getJiraUrl(jiraKey);

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors ${className}`}
        title="Open in Jira"
      >
        <span className="font-mono text-sm">{jiraKey}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    );
  }

  // Fallback: show as plain text if no URL configured
  return (
    <span
      className={`font-mono text-sm text-slate-600 dark:text-slate-400 ${className}`}
    >
      {jiraKey}
    </span>
  );
}
