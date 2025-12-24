import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { Project, CreateProjectInput } from "@/lib/types";

// GET /api/projects - List all projects with optional status filter
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const includeArchived = searchParams.get("archived") === "true";

    let query = "SELECT * FROM projects";
    const params: any[] = [];
    const conditions: string[] = [];

    // Exclude archived projects by default
    if (!includeArchived) {
      conditions.push("archived = FALSE");
    }

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";

    const projects = await db.all(query, ...params);

    // Fetch milestone stats for each project
    const projectsWithMilestones = await Promise.all(
      projects.map(async (project: any) => {
        const milestones = await db.all(
          "SELECT status, progress FROM milestones WHERE project_id = ?",
          project.id,
        );

        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(
          (m: any) => m.status === "completed",
        ).length;

        return {
          ...project,
          milestoneStats: {
            total: totalMilestones,
            completed: completedMilestones,
          },
        };
      }),
    );

    return NextResponse.json(projectsWithMilestones);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body: CreateProjectInput = await request.json();

    // Validate required fields
    if (!body.name || !body.status || !body.start_date) {
      return NextResponse.json(
        { error: "Missing required fields: name, status, start_date" },
        { status: 400 },
      );
    }

    // Validate status
    const validStatuses = ["Planning", "Active", "On Hold", "Completed"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
        },
        { status: 400 },
      );
    }

    await db.run(
      `INSERT INTO projects (name, status, start_date, end_date, description)
       VALUES (?, ?, ?, ?, ?)`,
      body.name,
      body.status,
      body.start_date,
      body.end_date || null,
      body.description || null,
    );

    const projectResult = await db.all(
      "SELECT * FROM projects WHERE id = (SELECT MAX(id) FROM projects)",
    );
    const project = projectResult[0];

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
