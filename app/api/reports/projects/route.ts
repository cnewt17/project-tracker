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

    // Fetch resource allocations
    const resources = await fetchResourceAllocations(db);

    // Build response
    const data: ProjectReportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportDate: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      },
      kpis,
      activeProjects: projectsWithComments,
      pendingProjects,
      resources,
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
        status: project.status,
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

async function fetchResourceAllocations(db: any) {
  const today = new Date().toISOString().split("T")[0];

  const resources = await db.all(`
    SELECT
      r.name,
      r.allocation_percentage,
      r.end_date,
      p.id as project_id,
      p.name as project_name
    FROM resources r
    JOIN projects p ON r.project_id = p.id
    WHERE r.start_date <= '${today}'
      AND (r.end_date >= '${today}' OR r.end_date IS NULL)
      AND p.archived = FALSE
    ORDER BY r.name, p.name
  `);

  // Group resources by name
  const groupedResources: { [key: string]: any } = {};

  resources.forEach((resource: any) => {
    if (!groupedResources[resource.name]) {
      groupedResources[resource.name] = {
        name: resource.name,
        projects: [],
      };
    }

    groupedResources[resource.name].projects.push({
      projectName: resource.project_name,
      allocation: Number(resource.allocation_percentage),
      endDate: resource.end_date,
    });
  });

  return Object.values(groupedResources);
}
