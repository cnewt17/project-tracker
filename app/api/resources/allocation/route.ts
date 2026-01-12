import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// GET /api/resources/allocation - Get total allocation per resource across all projects with project details
export async function GET() {
  try {
    const db = await getDatabase();

    // Get current date for filtering active allocations
    const today = new Date().toISOString().split("T")[0];

    // Get all resources grouped by name with current allocation and project details
    // Using LEFT JOIN to include resources that might not be assigned to any projects
    // Current allocation only counts projects that are active TODAY
    const allocations = await db.all(`
      SELECT
        r.name,
        STRING_AGG(DISTINCT r.type, ', ') as types,
        COALESCE(SUM(
          CASE
            WHEN r.start_date <= '${today}' AND (r.end_date >= '${today}' OR r.end_date IS NULL)
            THEN r.allocation_percentage
            ELSE 0
          END
        ), 0) as current_allocation,
        COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN r.project_id END) as project_count,
        COUNT(DISTINCT CASE
          WHEN p.id IS NOT NULL
            AND r.start_date <= '${today}'
            AND (r.end_date >= '${today}' OR r.end_date IS NULL)
          THEN r.project_id
        END) as active_project_count,
        LIST(CASE
          WHEN p.id IS NOT NULL THEN {
            'project_id': p.id,
            'project_name': p.name,
            'allocation': r.allocation_percentage,
            'start_date': r.start_date,
            'end_date': r.end_date,
            'project_status': p.status,
            'is_active': r.start_date <= '${today}' AND (r.end_date >= '${today}' OR r.end_date IS NULL)
          }
          ELSE NULL
        END) as projects,
        MIN(r.start_date) as earliest_start,
        MAX(COALESCE(r.end_date, '9999-12-31')) as latest_end
      FROM resources r
      LEFT JOIN projects p ON r.project_id = p.id
      GROUP BY r.name
      ORDER BY r.name
    `);

    // Convert and format the results
    const formattedAllocations = allocations.map((item: any) => {
      // Filter out NULL projects (from LEFT JOIN where no project exists)
      const projects = item.projects
        ? item.projects.filter((p: any) => p !== null)
        : [];

      return {
        name: item.name,
        types: item.types || "Unknown",
        current_allocation: Number(item.current_allocation) || 0,
        project_count: Number(item.project_count) || 0,
        active_project_count: Number(item.active_project_count) || 0,
        is_over_allocated: Number(item.current_allocation) > 100,
        projects: projects,
        earliest_start: item.earliest_start || null,
        latest_end: item.latest_end === "9999-12-31" ? null : item.latest_end,
      };
    });

    return NextResponse.json(formattedAllocations);
  } catch (error) {
    console.error("Error fetching resource allocations:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource allocations" },
      { status: 500 },
    );
  }
}
