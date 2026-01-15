import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import {
  isJiraClientConfigured,
  fetchJiraMilestoneData,
} from "@/lib/jira-client";
import { JiraSyncResult } from "@/lib/types";

// In-memory lock to prevent concurrent syncs
const syncLocks = new Map<number, boolean>();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  // Check if Jira is configured
  if (!isJiraClientConfigured()) {
    return NextResponse.json(
      {
        error:
          "Jira integration not configured. Set JIRA_EMAIL and JIRA_API_TOKEN.",
      },
      { status: 503 },
    );
  }

  // Check if a sync is already in progress for this project
  if (syncLocks.get(projectId)) {
    return NextResponse.json(
      { error: "A sync is already in progress for this project. Please wait." },
      { status: 409 },
    );
  }

  // Set lock
  syncLocks.set(projectId, true);

  try {
    const db = await getDatabase();

    // Verify project exists
    const projects = await db.all(
      "SELECT id, name FROM projects WHERE id = ?",
      projectId,
    );

    if (!projects || projects.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch all milestones with Jira keys for this project
    const milestones = await db.all(
      `SELECT id, project_id, name, jira_key
       FROM milestones
       WHERE project_id = ? AND jira_key IS NOT NULL AND jira_key != ''`,
      projectId,
    );

    const result: JiraSyncResult = {
      success: true,
      updated_count: 0,
      failed_count: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // If no milestones with Jira keys, just update the timestamp
    if (milestones.length === 0) {
      await db.run(
        "UPDATE projects SET last_jira_sync = CURRENT_TIMESTAMP WHERE id = ?",
        projectId,
      );
      return NextResponse.json(result);
    }

    // Sync each milestone
    for (const milestone of milestones) {
      try {
        const jiraData = await fetchJiraMilestoneData(milestone.jira_key);

        // Update milestone with Jira data
        await db.run(
          `UPDATE milestones
           SET due_date = ?,
               progress = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          jiraData.dueDate || milestone.due_date, // Keep existing if no due date in Jira
          jiraData.progress,
          milestone.id,
        );

        result.updated_count++;
      } catch (error: any) {
        result.failed_count++;
        result.errors.push({
          milestone_id: milestone.id,
          milestone_name: milestone.name,
          jira_key: milestone.jira_key,
          error: error.message || "Unknown error",
        });
      }
    }

    // Update last_jira_sync timestamp on project
    await db.run(
      "UPDATE projects SET last_jira_sync = CURRENT_TIMESTAMP WHERE id = ?",
      projectId,
    );

    // Set success to false if all milestones failed
    if (result.failed_count > 0 && result.updated_count === 0) {
      result.success = false;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error syncing milestones with Jira:", error);
    return NextResponse.json(
      { error: "Failed to sync milestones with Jira", details: error.message },
      { status: 500 },
    );
  } finally {
    // Always release the lock
    syncLocks.delete(projectId);
  }
}
