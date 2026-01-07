/**
 * Migration Script: Add RAG status to projects
 *
 * This script adds:
 * 1. rag_status column to projects table (defaults to 'N/A')
 * 2. project_status_updates table for tracking status history
 *
 * Run this once with: npx tsx scripts/migrate-rag-status.ts
 * After successful migration, you can delete this file.
 */

import { Database } from "duckdb-async";
import * as path from "path";

const DB_PATH = path.join(process.cwd(), "data", "projects.duckdb");

async function migrate() {
  console.log("🔄 Starting migration: Add RAG status to projects...");
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

    // Start a transaction
    await db.run("BEGIN TRANSACTION");

    // Check if rag_status column already exists
    const columns = await db.all(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'rag_status'",
    );

    if (columns.length > 0) {
      console.log(
        "ℹ️  rag_status column already exists. Skipping column addition.",
      );
    } else {
      // Add rag_status column to projects table (without constraint)
      await db.run("ALTER TABLE projects ADD COLUMN rag_status VARCHAR");
      console.log("✅ Added rag_status column to projects table");

      // Set default value for existing rows
      await db.run(
        "UPDATE projects SET rag_status = 'N/A' WHERE rag_status IS NULL",
      );
      console.log("✅ Set default RAG status to 'N/A' for existing projects");
    }

    // Check if project_status_updates table already exists
    const statusUpdatesTables = await db.all(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'project_status_updates'",
    );

    if (statusUpdatesTables.length > 0) {
      console.log(
        "ℹ️  project_status_updates table already exists. Skipping table creation.",
      );
    } else {
      // Create sequence for status updates
      await db.run(
        "CREATE SEQUENCE IF NOT EXISTS project_status_updates_id_seq START 1",
      );
      console.log("✅ Created project_status_updates sequence");

      // Create project_status_updates table
      await db.run(`
        CREATE TABLE project_status_updates (
          id INTEGER PRIMARY KEY DEFAULT nextval('project_status_updates_id_seq'),
          project_id INTEGER NOT NULL,
          rag_status VARCHAR NOT NULL CHECK (rag_status IN ('Red', 'Amber', 'Green', 'N/A')),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id)
        )
      `);
      console.log("✅ Created project_status_updates table");
    }

    // Commit the transaction
    await db.run("COMMIT");
    console.log("✅ Transaction committed");

    console.log("\n🎉 Migration completed successfully!");
    console.log("✨ Projects now have RAG status tracking.");
    console.log(
      "📝 You can now delete this migration script: scripts/migrate-rag-status.ts",
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
