import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { CreateMilestoneInput } from "@/lib/types";

// GET /api/milestones - Get all milestones or filter by project_id
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");

    let milestones;
    if (projectId) {
      milestones = await db.all(
        "SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC",
        projectId
      );
    } else {
      milestones = await db.all(
        "SELECT * FROM milestones ORDER BY due_date ASC"
      );
    }

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

// POST /api/milestones - Create new milestone
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body: CreateMilestoneInput = await request.json();

    // Validate required fields
    if (!body.project_id || !body.name || !body.due_date) {
      return NextResponse.json(
        { error: "Missing required fields: project_id, name, due_date" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "in_progress", "completed"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be one of: " + validStatuses.join(", "),
        },
        { status: 400 }
      );
    }

    // Validate progress
    if (body.progress !== undefined && (body.progress < 0 || body.progress > 100)) {
      return NextResponse.json(
        { error: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Check if project exists
    const projectResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      body.project_id
    );
    if (projectResult.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await db.run(
      `INSERT INTO milestones (project_id, name, description, due_date, status, progress)
       VALUES (?, ?, ?, ?, ?, ?)`,
      body.project_id,
      body.name,
      body.description || null,
      body.due_date,
      body.status || "pending",
      body.progress || 0
    );

    const milestones = await db.all(
      "SELECT * FROM milestones WHERE project_id = ? ORDER BY id DESC LIMIT 1",
      body.project_id
    );

    return NextResponse.json(milestones[0], { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}
