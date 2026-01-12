import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { DashboardStats } from "@/lib/types";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const db = await getDatabase();

    // Get total projects
    const totalProjectsResult = await db.all(
      "SELECT COUNT(*) as count FROM projects",
    );
    const totalProjects = Number(totalProjectsResult[0].count);

    // Get active projects
    const activeProjectsResult = await db.all(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'Active'",
    );
    const activeProjects = Number(activeProjectsResult[0].count);

    // Get total resources (count unique people by name)
    const totalResourcesResult = await db.all(
      "SELECT COUNT(DISTINCT name) as count FROM resources",
    );
    const totalResources = Number(totalResourcesResult[0].count);

    // Get over-allocated resources (resources with >100% current allocation as of today)
    const today = new Date().toISOString().split("T")[0];
    const overAllocatedQuery = `
      SELECT name, SUM(allocation_percentage) as current_allocation
      FROM resources
      WHERE start_date <= '${today}'
        AND (end_date >= '${today}' OR end_date IS NULL)
      GROUP BY name
      HAVING SUM(allocation_percentage) > 100
    `;
    const overAllocatedResult = await db.all(overAllocatedQuery);
    const overAllocatedResources = overAllocatedResult.length;

    // Get projects by status
    const statusBreakdown = await db.all(`
      SELECT status, COUNT(*) as count
      FROM projects
      GROUP BY status
    `);

    const projectsByStatus = {
      Completed: 0,
      Active: 0,
      Blocked: 0,
      Ready: 0,
      "Pending Sale Confirmation": 0,
      Cancelled: 0,
      "Sales Pipeline": 0,
    };

    statusBreakdown.forEach((row: any) => {
      projectsByStatus[row.status as keyof typeof projectsByStatus] = Number(
        row.count,
      );
    });

    const stats: DashboardStats = {
      totalProjects,
      activeProjects,
      totalResources,
      overAllocatedResources,
      projectsByStatus,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 },
    );
  }
}
