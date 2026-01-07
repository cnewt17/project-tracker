import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { UpdateProjectInput } from "@/lib/types";
import { PROJECT_STATUSES } from "@/lib/constants";

// GET /api/projects/[id] - Get single project with resources
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const projectResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id,
    );
    const project = projectResult[0];

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const resources = await db.all(
      "SELECT * FROM resources WHERE project_id = ? ORDER BY created_at DESC",
      id,
    );

    const milestones = await db.all(
      "SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC",
      id,
    );

    return NextResponse.json({ ...project, resources, milestones });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const body: UpdateProjectInput = await request.json();

    // Check if project exists
    const existingResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id,
    );
    const existing = existingResult[0];
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = PROJECT_STATUSES.map((s) => s.value);
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            error:
              "Invalid status. Must be one of: " + validStatuses.join(", "),
          },
          { status: 400 },
        );
      }
    }

    // Validate date range if both dates are provided or being updated
    const finalStartDate =
      body.start_date !== undefined ? body.start_date : existing.start_date;
    const finalEndDate =
      body.end_date !== undefined ? body.end_date : existing.end_date;

    if (finalStartDate && finalEndDate) {
      const startDate = new Date(finalStartDate);
      const endDate = new Date(finalEndDate);
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 },
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(body.name);
    }
    if (body.status !== undefined) {
      updates.push("status = ?");
      values.push(body.status);
    }
    if (body.start_date !== undefined) {
      updates.push("start_date = ?");
      values.push(body.start_date);
    }
    if (body.end_date !== undefined) {
      updates.push("end_date = ?");
      values.push(body.end_date);
    }
    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description);
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
      `UPDATE projects SET ${updates.join(", ")} WHERE id = ?`,
      ...values,
    );

    const projectResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id,
    );
    return NextResponse.json(projectResult[0]);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const existingResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id,
    );
    const existing = existingResult[0];
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Manually delete associated resources and milestones first
    await db.run("DELETE FROM resources WHERE project_id = ?", id);
    await db.run("DELETE FROM milestones WHERE project_id = ?", id);
    await db.run("DELETE FROM projects WHERE id = ?", id);
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
