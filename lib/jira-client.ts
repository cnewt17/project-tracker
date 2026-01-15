import { Version3Client } from "jira.js";

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    duedate?: string;
    status: {
      statusCategory: {
        key: string;
      };
    };
    subtasks?: Array<{
      id: string;
      key: string;
      fields: {
        status: {
          statusCategory: {
            key: string;
          };
        };
      };
    }>;
  };
}

export function isJiraClientConfigured(): boolean {
  return !!(
    process.env.JIRA_EMAIL &&
    process.env.JIRA_API_TOKEN &&
    process.env.NEXT_PUBLIC_JIRA_BASE_URL
  );
}

export function getJiraClient(): Version3Client {
  if (!isJiraClientConfigured()) {
    throw new Error(
      "Jira client not configured. Missing environment variables.",
    );
  }

  return new Version3Client({
    host: process.env.NEXT_PUBLIC_JIRA_BASE_URL!,
    authentication: {
      basic: {
        email: process.env.JIRA_EMAIL!,
        apiToken: process.env.JIRA_API_TOKEN!,
      },
    },
  });
}

export async function searchJiraIssuesWithJQL(
  jql: string,
): Promise<JiraIssue[]> {
  const client = getJiraClient();

  try {
    const response =
      await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
        jql,
        fields: ["status"],
        maxResults: 100,
      });

    return (response.issues || []) as unknown as JiraIssue[];
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Jira authentication failed. Check credentials.");
    } else if (error.response?.status === 429) {
      throw new Error("Jira rate limit exceeded. Try again in a few minutes.");
    } else {
      throw new Error(`Failed to search Jira issues: ${error.message}`);
    }
  }
}

export async function fetchJiraIssue(issueKey: string): Promise<JiraIssue> {
  const client = getJiraClient();

  try {
    const issue = await client.issues.getIssue({
      issueIdOrKey: issueKey,
      fields: ["duedate", "status"],
    });

    return issue as unknown as JiraIssue;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Jira issue ${issueKey} not found`);
    } else if (error.response?.status === 401) {
      throw new Error("Jira authentication failed. Check credentials.");
    } else if (error.response?.status === 429) {
      throw new Error("Jira rate limit exceeded. Try again in a few minutes.");
    } else {
      throw new Error(
        `Failed to fetch Jira issue ${issueKey}: ${error.message}`,
      );
    }
  }
}

export function calculateJiraProgress(
  issue: JiraIssue,
  customSubtasks?: JiraIssue[],
): number {
  const subtasks = customSubtasks || [];
  console.log("subtasks", subtasks);
  if (subtasks.length === 0) {
    // No subtasks: 0% until parent is Done, then 100%
    const isDone = issue.fields.status.statusCategory.key === "done";
    return isDone ? 100 : 0;
  }

  // With subtasks: calculate percentage based on completed subtasks
  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.fields.status.statusCategory.key === "done",
  ).length;

  const percentage = (completedSubtasks / subtasks.length) * 100;
  return Math.round(percentage);
}

export interface JiraMilestoneData {
  dueDate: string | null;
  progress: number;
}

export async function fetchJiraMilestoneData(
  jiraKey: string,
): Promise<JiraMilestoneData> {
  const issue = await fetchJiraIssue(jiraKey);

  // Try to fetch child issues using JQL for custom ticket types
  let childIssues: JiraIssue[] = [];
  try {
    childIssues = await searchJiraIssuesWithJQL(`parent = ${jiraKey}`);
  } catch (error) {
    console.warn(`Could not fetch child issues for ${jiraKey}:`, error);
  }

  // Use child issues from JQL search if found, otherwise fall back to subtasks field
  const subtasksToUse =
    childIssues.length > 0 ? childIssues : issue.fields.subtasks;

  return {
    dueDate: issue.fields.duedate || null,
    progress: calculateJiraProgress(issue, subtasksToUse),
  };
}
