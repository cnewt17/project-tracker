/**
 * Migration Script: Make project start_date nullable
 *
 * This script updates the existing database schema to make the start_date column
 * optional (nullable) in the projects table.
 *
 * Run this once with: npx tsx scripts/migrate-start-date.ts
 * After successful migration, you can delete this file.
 */

import { Database } from "duckdb-async";
import * as path from "path";

const DB_PATH = path.join(process.cwd(), "data", "projects.duckdb");

async function migrate() {
  console.log("🔄 Starting migration: Make start_date nullable...");
  console.log(`📁 Database: ${DB_PATH}`);

  let db: Database | null = null;

  try {
    // Connect to the database
    db = await Database.create(DB_PATH);
    console.log("✅ Connected to database");

    // Check if projects table exists
    const tables = await db.all(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'projects'",
    );

    if (tables.length === 0) {
      console.log("⚠️  Projects table doesn't exist. No migration needed.");
      await db.close();
      return;
    }

    console.log("📋 Projects table found");

    // DuckDB doesn't support ALTER COLUMN DROP NOT NULL directly
    // We need to use a different approach: recreate the table
    console.log("🔧 Recreating projects table with nullable start_date...");

    // Start a transaction
    await db.run("BEGIN TRANSACTION");

    // Clean up any existing backup tables from failed previous runs
    try {
      await db.run("DROP TABLE IF EXISTS resources_backup");
      await db.run("DROP TABLE IF EXISTS milestones_backup");
      await db.run("DROP TABLE IF EXISTS projects_new");
      console.log("✅ Cleaned up any existing backup tables");
    } catch (error) {
      console.log("⚠️  No backup tables to clean up");
    }

    // Step 1: Create temporary tables for resources and milestones to backup data
    await db.run(`
      CREATE TABLE resources_backup AS
      SELECT * FROM resources
    `);
    console.log("✅ Backed up resources table");

    await db.run(`
      CREATE TABLE milestones_backup AS
      SELECT * FROM milestones
    `);
    console.log("✅ Backed up milestones table");

    // Step 2: Drop the dependent tables (resources and milestones)
    await db.run("DROP TABLE resources");
    console.log("✅ Dropped resources table");

    await db.run("DROP TABLE milestones");
    console.log("✅ Dropped milestones table");

    // Step 3: Create a temporary table with the new schema
    await db.run(`
      CREATE TABLE projects_new (
        id INTEGER PRIMARY KEY DEFAULT nextval('projects_id_seq'),
        name VARCHAR NOT NULL,
        status VARCHAR NOT NULL,
        start_date DATE,
        end_date DATE,
        description TEXT,
        archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created new projects table");

    // Step 4: Copy all data from old table to new table
    await db.run(`
      INSERT INTO projects_new (id, name, status, start_date, end_date, description, archived, created_at, updated_at)
      SELECT id, name, status, start_date, end_date, description, archived, created_at, updated_at
      FROM projects
    `);
    console.log("✅ Copied data to new projects table");

    // Step 5: Drop the old table
    await db.run("DROP TABLE projects");
    console.log("✅ Dropped old projects table");

    // Step 6: Rename new table to original name
    await db.run("ALTER TABLE projects_new RENAME TO projects");
    console.log("✅ Renamed new table to 'projects'");

    // Step 7: Recreate resources table
    await db.run(`
      CREATE TABLE resources (
        id INTEGER PRIMARY KEY DEFAULT nextval('resources_id_seq'),
        project_id INTEGER NOT NULL,
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        allocation_percentage DECIMAL(5,2) NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
        start_date DATE NOT NULL,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);
    console.log("✅ Recreated resources table");

    // Step 8: Restore resources data
    await db.run(`
      INSERT INTO resources (id, project_id, name, type, allocation_percentage, start_date, end_date, created_at, updated_at)
      SELECT id, project_id, name, type, allocation_percentage, start_date, end_date, created_at, updated_at
      FROM resources_backup
    `);
    console.log("✅ Restored resources data");

    // Step 9: Recreate milestones table
    await db.run(`
      CREATE TABLE milestones (
        id INTEGER PRIMARY KEY DEFAULT nextval('milestones_id_seq'),
        project_id INTEGER NOT NULL,
        name VARCHAR NOT NULL,
        description TEXT,
        due_date DATE NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'pending',
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);
    console.log("✅ Recreated milestones table");

    // Step 10: Restore milestones data
    await db.run(`
      INSERT INTO milestones (id, project_id, name, description, due_date, status, progress, created_at, updated_at)
      SELECT id, project_id, name, description, due_date, status, progress, created_at, updated_at
      FROM milestones_backup
    `);
    console.log("✅ Restored milestones data");

    // Step 11: Drop backup tables
    await db.run("DROP TABLE resources_backup");
    await db.run("DROP TABLE milestones_backup");
    console.log("✅ Cleaned up backup tables");

    // Commit the transaction
    await db.run("COMMIT");
    console.log("✅ Transaction committed");

    console.log("\n🎉 Migration completed successfully!");
    console.log("✨ The start_date column is now nullable.");
    console.log(
      "📝 You can now delete this migration script: scripts/migrate-start-date.ts",
    );
  } catch (error) {
    console.error("\n❌ Migration failed:", error);

    if (db) {
      try {
        await db.run("ROLLBACK");
        console.log("🔄 Transaction rolled back");
      } catch (rollbackError) {
        console.error("Failed to rollback:", rollbackError);
      }
    }

    process.exit(1);
  } finally {
    if (db) {
      await db.close();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the migration
migrate().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
