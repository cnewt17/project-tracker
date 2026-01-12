import { getDatabase } from "../lib/db";

async function migrateUtilizationTable() {
  console.log("Starting migration: Adding team_utilization_snapshots table...");

  try {
    const db = await getDatabase();

    // Create sequence
    await db.run(`
      CREATE SEQUENCE IF NOT EXISTS team_utilization_snapshots_id_seq START 1
    `);
    console.log("✓ Created sequence");

    // Create table
    await db.run(`
      CREATE TABLE IF NOT EXISTS team_utilization_snapshots (
        id INTEGER PRIMARY KEY DEFAULT nextval('team_utilization_snapshots_id_seq'),
        week_start_date DATE NOT NULL UNIQUE,
        week_end_date DATE NOT NULL,
        total_capacity DECIMAL(10,2) NOT NULL,
        total_allocated DECIMAL(10,2) NOT NULL,
        utilization_percentage DECIMAL(5,2) NOT NULL,
        unique_resource_count INTEGER NOT NULL,
        snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Created team_utilization_snapshots table");

    // Create index
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_utilization_week_start
      ON team_utilization_snapshots(week_start_date)
    `);
    console.log("✓ Created index on week_start_date");

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateUtilizationTable();
