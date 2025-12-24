import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// PUT /api/projects/[id]/archive - Archive/Unarchive project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const body = await request.json();
    const { archived } = body;

    // Check if project exists
    const existingResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id
    );
    const existing = existingResult[0];
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await db.run(
      "UPDATE projects SET archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      archived,
      id
    );

    const projectResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id
    );
    return NextResponse.json(projectResult[0]);
  } catch (error) {
    console.error("Error archiving project:", error);
    return NextResponse.json(
      { error: "Failed to archive project" },
      { status: 500 }
    );
  }
}
