import { getDatabase } from "./db";

export async function seedDatabase() {
  const db = await getDatabase();

  console.log("Seeding database...");

  // Check if data already exists
  const existing = await db.all("SELECT COUNT(*) as count FROM projects");
  if (existing[0].count > 0) {
    console.log("Database already contains data. Skipping seed.");
    return;
  }

  // Insert sample projects
  const projects = [
    {
      name: "Website Redesign",
      status: "Active",
      start_date: "2025-01-15",
      end_date: "2025-04-30",
      description: "Complete redesign of company website with modern UI/UX",
    },
    {
      name: "Mobile App Development",
      status: "Planning",
      start_date: "2025-02-01",
      end_date: null,
      description: "Native mobile app for iOS and Android platforms",
    },
    {
      name: "API Integration",
      status: "On Hold",
      start_date: "2024-11-01",
      end_date: "2025-01-31",
      description: "Integration with third-party payment and analytics APIs",
    },
    {
      name: "Database Migration",
      status: "Completed",
      start_date: "2024-09-01",
      end_date: "2024-12-15",
      description: "Migration from legacy database to modern cloud solution",
    },
  ];

  for (const project of projects) {
    await db.run(
      `INSERT INTO projects (name, status, start_date, end_date, description)
       VALUES (?, ?, ?, ?, ?)`,
      project.name,
      project.status,
      project.start_date,
      project.end_date,
      project.description,
    );

    // Get the last inserted ID
    const result = await db.all("SELECT MAX(id) as id FROM projects");
    const projectId = result[0].id;
    console.log(`Created project: ${project.name} (ID: ${projectId})`);

    // Add resources for active and planning projects
    if (project.status === "Active" || project.status === "Planning") {
      const resources = [
        {
          name: "John Doe",
          type: "Developer",
          allocation: 80,
        },
        {
          name: "Jane Smith",
          type: "Designer",
          allocation: 60,
        },
        {
          name: "Bob Wilson",
          type: "Project Manager",
          allocation: 40,
        },
      ];

      for (const resource of resources) {
        await db.run(
          `INSERT INTO resources (project_id, name, type, allocation_percentage, start_date, end_date)
           VALUES (?, ?, ?, ?, ?, ?)`,
          projectId,
          resource.name,
          resource.type,
          resource.allocation,
          project.start_date,
          project.end_date,
        );
      }
    }
  }

  console.log("Database seeded successfully!");
}
