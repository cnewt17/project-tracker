import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// POST /api/projects/[id]/duplicate - Duplicate project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    // Get the original project
    const projectResult = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      id
    );
    const project = projectResult[0];

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create duplicate project with "(Copy)" suffix
    await db.run(
      `INSERT INTO projects (name, status, start_date, end_date, description, archived)
       VALUES (?, ?, ?, ?, ?, ?)`,
      `${project.name} (Copy)`,
      project.status,
      project.start_date,
      project.end_date,
      project.description,
      false // New copy is not archived
    );

    // Get the newly created project
    const newProjectResult = await db.all(
      "SELECT * FROM projects WHERE id = (SELECT MAX(id) FROM projects)"
    );
    const newProject = newProjectResult[0];

    // Duplicate resources
    const resources = await db.all(
      "SELECT * FROM resources WHERE project_id = ?",
      id
    );

    for (const resource of resources) {
      await db.run(
        `INSERT INTO resources (project_id, name, type, allocation_percentage, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        newProject.id,
        resource.name,
        resource.type,
        resource.allocation_percentage,
        resource.start_date,
        resource.end_date
      );
    }

    // Duplicate milestones
    const milestones = await db.all(
      "SELECT * FROM milestones WHERE project_id = ?",
      id
    );

    for (const milestone of milestones) {
      await db.run(
        `INSERT INTO milestones (project_id, name, description, due_date, status, progress)
         VALUES (?, ?, ?, ?, ?, ?)`,
        newProject.id,
        milestone.name,
        milestone.description,
        milestone.due_date,
        "pending", // Reset status to pending
        0 // Reset progress to 0
      );
    }

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error duplicating project:", error);
    return NextResponse.json(
      { error: "Failed to duplicate project" },
      { status: 500 }
    );
  }
}
