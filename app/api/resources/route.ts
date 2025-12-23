import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { CreateResourceInput } from "@/lib/types";

// GET /api/resources - List all resources with optional project_id filter
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("project_id");

    let query = "SELECT * FROM resources";
    const params: any[] = [];

    if (projectId) {
      query += " WHERE project_id = ?";
      params.push(projectId);
    }

    query += " ORDER BY created_at DESC";

    const resources = await db.all(query, ...params);
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 },
    );
  }
}

// POST /api/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body: CreateResourceInput = await request.json();

    // Validate required fields
    if (
      !body.project_id ||
      !body.name ||
      !body.type ||
      body.allocation_percentage === undefined ||
      !body.start_date
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: project_id, name, type, allocation_percentage, start_date",
        },
        { status: 400 },
      );
    }

    // Validate allocation percentage
    if (body.allocation_percentage < 0 || body.allocation_percentage > 100) {
      return NextResponse.json(
        { error: "Allocation percentage must be between 0 and 100" },
        { status: 400 },
      );
    }

    // Check if project exists
    const projectResult = await db.all(
      "SELECT id FROM projects WHERE id = ?",
      body.project_id,
    );
    const project = projectResult[0];
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await db.run(
      `INSERT INTO resources (project_id, name, type, allocation_percentage, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      body.project_id,
      body.name,
      body.type,
      body.allocation_percentage,
      body.start_date,
      body.end_date || null,
    );

    const resourceResult = await db.all(
      "SELECT * FROM resources WHERE id = (SELECT MAX(id) FROM resources)",
    );
    const resource = resourceResult[0];

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 },
    );
  }
}
