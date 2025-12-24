import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { UpdateMilestoneInput } from "@/lib/types";

// GET /api/milestones/[id] - Get single milestone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const milestoneResult = await db.all(
      "SELECT * FROM milestones WHERE id = ?",
      id
    );
    const milestone = milestoneResult[0];

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error fetching milestone:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestone" },
      { status: 500 }
    );
  }
}

// PUT /api/milestones/[id] - Update milestone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const body: UpdateMilestoneInput = await request.json();

    // Check if milestone exists
    const existingResult = await db.all(
      "SELECT * FROM milestones WHERE id = ?",
      id
    );
    const existing = existingResult[0];
    if (!existing) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ["pending", "in_progress", "completed"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            error:
              "Invalid status. Must be one of: " + validStatuses.join(", "),
          },
          { status: 400 }
        );
      }
    }

    // Validate progress if provided
    if (body.progress !== undefined && (body.progress < 0 || body.progress > 100)) {
      return NextResponse.json(
        { error: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(body.name);
    }
    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description);
    }
    if (body.due_date !== undefined) {
      updates.push("due_date = ?");
      values.push(body.due_date);
    }
    if (body.status !== undefined) {
      updates.push("status = ?");
      values.push(body.status);
    }
    if (body.progress !== undefined) {
      updates.push("progress = ?");
      values.push(body.progress);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    if (updates.length === 1) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    await db.run(
      `UPDATE milestones SET ${updates.join(", ")} WHERE id = ?`,
      ...values
    );

    const milestoneResult = await db.all(
      "SELECT * FROM milestones WHERE id = ?",
      id
    );
    return NextResponse.json(milestoneResult[0]);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

// DELETE /api/milestones/[id] - Delete milestone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const existingResult = await db.all(
      "SELECT * FROM milestones WHERE id = ?",
      id
    );
    const existing = existingResult[0];
    if (!existing) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    await db.run("DELETE FROM milestones WHERE id = ?", id);
    return NextResponse.json({ message: "Milestone deleted successfully" });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
