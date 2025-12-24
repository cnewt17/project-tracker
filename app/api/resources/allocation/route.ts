import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// GET /api/resources/allocation - Get total allocation per resource across all projects
export async function GET() {
  try {
    const db = await getDatabase();

    // Get all resources grouped by name with total allocation
    const allocations = await db.all(`
      SELECT
        name,
        SUM(allocation_percentage) as total_allocation,
        COUNT(*) as project_count
      FROM resources
      GROUP BY name
      ORDER BY name
    `);

    // Convert BigInt to Number for JSON serialization
    const formattedAllocations = allocations.map((item: any) => ({
      name: item.name,
      total_allocation: Number(item.total_allocation),
      project_count: Number(item.project_count),
      is_over_allocated: Number(item.total_allocation) > 100,
    }));

    return NextResponse.json(formattedAllocations);
  } catch (error) {
    console.error("Error fetching resource allocations:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource allocations" },
      { status: 500 }
    );
  }
}
