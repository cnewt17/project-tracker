import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { CreateProjectStatusUpdateInput } from "@/lib/types";
import { RAG_STATUSES } from "@/lib/constants";

// GET /api/projects/[id]/status-updates - Get all status updates for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    // Check if project exists
    const projectResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id,
    );
    if (projectResult.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get all status updates for the project (ordered by date DESC - newest first)
    const updates = await db.all(
      "SELECT * FROM project_status_updates WHERE project_id = ? ORDER BY created_at DESC",
      id,
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error fetching status updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch status updates" },
      { status: 500 },
    );
  }
}

// POST /api/projects/[id]/status-updates - Create new status update
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const body: CreateProjectStatusUpdateInput = await request.json();

    // Validate required fields
    if (!body.rag_status) {
      return NextResponse.json(
        { error: "Missing required field: rag_status" },
        { status: 400 },
      );
    }

    // Validate rag_status
    const validStatuses = RAG_STATUSES.map((s) => s.value);
    if (!validStatuses.includes(body.rag_status)) {
      return NextResponse.json(
        {
          error:
            "Invalid RAG status. Must be one of: " + validStatuses.join(", "),
        },
        { status: 400 },
      );
    }

    // Check if project exists
    const projectResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id,
    );
    if (projectResult.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Insert status update
    await db.run(
      `INSERT INTO project_status_updates (project_id, rag_status, comment)
       VALUES (?, ?, ?)`,
      id,
      body.rag_status,
      body.comment || null,
    );

    // Update project's current rag_status
    await db.run(
      "UPDATE projects SET rag_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      body.rag_status,
      id,
    );

    // Get the created update
    const updates = await db.all(
      "SELECT * FROM project_status_updates WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
      id,
    );

    return NextResponse.json(updates[0], { status: 201 });
  } catch (error) {
    console.error("Error creating status update:", error);
    return NextResponse.json(
      { error: "Failed to create status update" },
      { status: 500 },
    );
  }
}
