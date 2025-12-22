import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { UpdateResourceInput } from "@/lib/types";

// GET /api/resources/[id] - Get single resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const resourceResult = await db.all(
      "SELECT * FROM resources WHERE id = ?",
      id,
    );
    const resource = resourceResult[0];

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 },
    );
  }
}

// PUT /api/resources/[id] - Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const body: UpdateResourceInput = await request.json();

    // Check if resource exists
    const existingResult = await db.all(
      "SELECT * FROM resources WHERE id = ?",
      id,
    );
    const existing = existingResult[0];
    if (!existing) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    // Validate allocation percentage if provided
    if (body.allocation_percentage !== undefined) {
      if (body.allocation_percentage < 0 || body.allocation_percentage > 100) {
        return NextResponse.json(
          { error: "Allocation percentage must be between 0 and 100" },
          { status: 400 },
        );
      }
    }

    // Validate project exists if project_id is being updated
    if (body.project_id !== undefined) {
      const projectResult = await db.all(
        "SELECT id FROM projects WHERE id = ?",
        body.project_id,
      );
      const project = projectResult[0];
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (body.project_id !== undefined) {
      updates.push("project_id = ?");
      values.push(body.project_id);
    }
    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(body.name);
    }
    if (body.type !== undefined) {
      updates.push("type = ?");
      values.push(body.type);
    }
    if (body.allocation_percentage !== undefined) {
      updates.push("allocation_percentage = ?");
      values.push(body.allocation_percentage);
    }
    if (body.start_date !== undefined) {
      updates.push("start_date = ?");
      values.push(body.start_date);
    }
    if (body.end_date !== undefined) {
      updates.push("end_date = ?");
      values.push(body.end_date);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    if (updates.length === 1) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    await db.run(
      `UPDATE resources SET ${updates.join(", ")} WHERE id = ?`,
      ...values,
    );

    const resourceResult = await db.all(
      "SELECT * FROM resources WHERE id = ?",
      id,
    );
    return NextResponse.json(resourceResult[0]);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 },
    );
  }
}

// DELETE /api/resources/[id] - Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const existingResult = await db.all(
      "SELECT * FROM resources WHERE id = ?",
      id,
    );
    const existing = existingResult[0];
    if (!existing) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    await db.run("DELETE FROM resources WHERE id = ?", id);
    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 },
    );
  }
}
