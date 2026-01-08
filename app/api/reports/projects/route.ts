import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { ProjectReportData } from "@/lib/types";

export async function GET() {
  try {
    const db = await getDatabase();

    // Fetch KPIs
    const kpis = await fetchKPIs(db);

    // Fetch active projects
    const activeProjects = await fetchActiveProjects(db);

    // Fetch latest comments for each active project
    const projectsWithComments = await enrichWithComments(db, activeProjects);

    // Fetch pending projects
    const pendingProjects = await fetchPendingProjects(db);

    // Build response
    const data: ProjectReportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      kpis,
      activeProjects: projectsWithComments,
      pendingProjects,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}

async function fetchKPIs(db: any) {
  const result = await db.all(`
    SELECT
      COUNT(CASE WHEN status = 'Active' AND archived = FALSE THEN 1 END) as active_count,
      COUNT(CASE WHEN status = 'Blocked' AND archived = FALSE THEN 1 END) as blocked_count,
      COUNT(CASE WHEN status IN ('Ready', 'Pending Sale Confirmation', 'Sales Pipeline') AND archived = FALSE THEN 1 END) as pending_count
    FROM projects
  `);

  return {
    activeProjects: Number(result[0].active_count),
    blockedProjects: Number(result[0].blocked_count),
    pendingProjects: Number(result[0].pending_count),
  };
}

async function fetchActiveProjects(db: any) {
  return await db.all(`
    SELECT
      id,
      name,
      end_date,
      rag_status,
      status
    FROM projects
    WHERE status IN ('Active', 'Blocked')
      AND archived = FALSE
    ORDER BY
      CASE WHEN end_date IS NULL THEN 1 ELSE 0 END,
      end_date ASC
  `);
}

async function enrichWithComments(db: any, projects: any[]) {
  return await Promise.all(
    projects.map(async (project) => {
      const comments = await db.all(
        `SELECT comment
         FROM project_status_updates
         WHERE project_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        project.id,
      );

      return {
        id: project.id,
        name: project.name,
        endDate: project.end_date,
        ragStatus: project.rag_status,
        latestComment: comments[0]?.comment || null,
      };
    }),
  );
}

async function fetchPendingProjects(db: any) {
  const projects = await db.all(`
    SELECT id, name, status
    FROM projects
    WHERE status IN ('Ready', 'Pending Sale Confirmation', 'Sales Pipeline')
      AND archived = FALSE
    ORDER BY name ASC
  `);

  // Sort by status priority: Ready > Pending Sale Confirmation > Sales Pipeline
  const statusOrder: { [key: string]: number } = {
    Ready: 1,
    "Pending Sale Confirmation": 2,
    "Sales Pipeline": 3,
  };

  return projects.sort((a: any, b: any) => {
    const orderA = statusOrder[a.status] || 999;
    const orderB = statusOrder[b.status] || 999;
    return orderA - orderB;
  });
}
