import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import type {
  UtilizationSnapshot,
  UtilizationChartData,
  UtilizationAPIResponse,
} from "@/lib/types";

function getWeekBounds(date: Date): { monday: string; sunday: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    monday: monday.toISOString().split("T")[0],
    sunday: sunday.toISOString().split("T")[0],
  };
}

function formatDateUK(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

export async function GET() {
  try {
    const db = await getDatabase();

    const snapshots = (await db.all(`
      SELECT
        id,
        week_start_date,
        week_end_date,
        total_capacity,
        total_allocated,
        utilization_percentage,
        unique_resource_count,
        snapshot_date,
        created_at
      FROM team_utilization_snapshots
      ORDER BY week_start_date ASC
    `)) as UtilizationSnapshot[];

    // Transform snapshots into chart data
    const chartData: UtilizationChartData[] = snapshots.map(
      (snapshot, index) => {
        const weekStart = new Date(snapshot.week_start_date);
        const weekNumber = getWeekNumber(weekStart);

        return {
          week: formatDateUK(snapshot.week_start_date),
          weekLabel: `Week ${weekNumber}`,
          utilization: Number(snapshot.utilization_percentage),
          capacity: Number(snapshot.total_capacity),
          allocated: Number(snapshot.total_allocated),
          resourceCount: snapshot.unique_resource_count,
          weekStartDate: snapshot.week_start_date,
        };
      },
    );

    // Calculate summary statistics
    const totalUtilization = chartData.reduce(
      (sum, d) => sum + d.utilization,
      0,
    );
    const averageUtilization =
      chartData.length > 0 ? totalUtilization / chartData.length : 0;

    // Get current week utilization
    const today = new Date();
    const { monday: currentMonday } = getWeekBounds(today);
    const currentWeekData = chartData.find(
      (d) => d.weekStartDate === currentMonday,
    );
    const currentWeekUtilization = currentWeekData
      ? currentWeekData.utilization
      : null;

    const response: UtilizationAPIResponse = {
      data: chartData,
      summary: {
        averageUtilization: Math.round(averageUtilization * 100) / 100,
        currentWeekUtilization:
          currentWeekUtilization !== null
            ? Math.round(currentWeekUtilization * 100) / 100
            : null,
        weeksTracked: chartData.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch utilization data:", error);
    return NextResponse.json(
      { error: "Failed to fetch utilization data" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const db = await getDatabase();
    const today = new Date();
    const { monday, sunday } = getWeekBounds(today);

    // Count unique resources active during this week
    const resourceCountResult = await db.all(`
      SELECT COUNT(DISTINCT name) as count
      FROM resources
      WHERE start_date <= '${sunday}'
        AND (end_date >= '${monday}' OR end_date IS NULL)
    `);

    const uniqueResourceCount = Number(resourceCountResult[0]?.count || 0);

    // Calculate total capacity (100% per unique resource)
    const totalCapacity = uniqueResourceCount * 100;

    // Sum allocations for resources active during this week
    const allocationResult = await db.all(`
      SELECT COALESCE(SUM(allocation_percentage), 0) as total
      FROM resources
      WHERE start_date <= '${sunday}'
        AND (end_date >= '${monday}' OR end_date IS NULL)
    `);

    const totalAllocated = Number(allocationResult[0]?.total || 0);

    // Calculate utilization percentage (handle division by zero)
    const utilizationPercentage =
      totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;

    // Get current timestamp
    const now = new Date().toISOString();

    // Insert or update snapshot (using INSERT OR REPLACE for DuckDB)
    await db.run(`
      INSERT INTO team_utilization_snapshots (
        week_start_date,
        week_end_date,
        total_capacity,
        total_allocated,
        utilization_percentage,
        unique_resource_count,
        snapshot_date
      ) VALUES (
        '${monday}',
        '${sunday}',
        ${totalCapacity},
        ${totalAllocated},
        ${utilizationPercentage},
        ${uniqueResourceCount},
        '${now}'
      )
      ON CONFLICT (week_start_date) DO UPDATE SET
        week_end_date = '${sunday}',
        total_capacity = ${totalCapacity},
        total_allocated = ${totalAllocated},
        utilization_percentage = ${utilizationPercentage},
        unique_resource_count = ${uniqueResourceCount},
        snapshot_date = '${now}'
    `);

    // Fetch the created/updated snapshot
    const snapshotResult = await db.all(`
      SELECT
        id,
        week_start_date,
        week_end_date,
        total_capacity,
        total_allocated,
        utilization_percentage,
        unique_resource_count,
        snapshot_date,
        created_at
      FROM team_utilization_snapshots
      WHERE week_start_date = '${monday}'
    `);

    const snapshot = snapshotResult[0] as UtilizationSnapshot;

    return NextResponse.json({
      success: true,
      snapshot,
      message: "Utilization snapshot captured successfully",
    });
  } catch (error) {
    console.error("Failed to create utilization snapshot:", error);
    return NextResponse.json(
      { error: "Failed to create utilization snapshot" },
      { status: 500 },
    );
  }
}
