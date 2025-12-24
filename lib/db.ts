import { Database } from "duckdb-async";
import * as fs from "fs";
import * as path from "path";

let db: Database | null = null;

const DB_PATH = path.join(process.cwd(), "data", "projects.duckdb");

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

async function initializeSchema(database: Database) {
  // Create projects table with sequence
  await database.run(`
    CREATE SEQUENCE IF NOT EXISTS projects_id_seq START 1
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY DEFAULT nextval('projects_id_seq'),
      name VARCHAR NOT NULL,
      status VARCHAR NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create resources table with sequence
  await database.run(`
    CREATE SEQUENCE IF NOT EXISTS resources_id_seq START 1
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS resources (
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

  // Create milestones table with sequence
  await database.run(`
    CREATE SEQUENCE IF NOT EXISTS milestones_id_seq START 1
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS milestones (
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

  console.log("Database schema initialized");
}

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  try {
    await ensureDataDirectory();

    const isNewDatabase = !fs.existsSync(DB_PATH);

    db = await Database.create(DB_PATH);

    if (isNewDatabase) {
      console.log("Initializing new database...");
      await initializeSchema(db);
    }

    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
