# Project Tracker

A Next.js application for tracking projects and their resource allocation, built with TypeScript, TailwindCSS, and DuckDB.

## Features

- **Project Management**: Create, view, update, and delete projects with status tracking
- **Resource Management**: Assign resources to projects with allocation percentages
- **Dashboard**: View key metrics including total projects, active projects, and over-allocated resources
- **Real-time Updates**: Track resource allocation across multiple projects
- **Local Database**: Uses DuckDB for embedded, file-based data persistence

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: DuckDB (embedded)
- **Styling**: TailwindCSS
- **Database Library**: duckdb-async

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Seed the database with sample data (optional):
```bash
npm run seed
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run seed` - Seed the database with sample data
- `npm run lint` - Run ESLint

## Project Structure

```
project-tracker/
├── app/
│   ├── api/              # API routes
│   │   ├── dashboard/    # Dashboard statistics
│   │   ├── projects/     # Project CRUD operations
│   │   └── resources/    # Resource CRUD operations
│   ├── projects/         # Project pages
│   │   ├── [id]/        # Project detail page
│   │   └── new/         # Create project page
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Dashboard page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── ProjectCard.tsx
│   ├── ResourceTable.tsx
│   └── StatCard.tsx
├── lib/                 # Utilities and database
│   ├── db.ts           # Database connection
│   ├── seed.ts         # Seed data
│   └── types.ts        # TypeScript types
├── data/               # Database files (created on first run)
│   └── projects.duckdb
└── scripts/            # Utility scripts
    └── seed.ts
```

## Database Schema

### Projects Table
- `id`: Integer (Primary Key)
- `name`: String
- `status`: String (Planning, Active, On Hold, Completed)
- `start_date`: Date
- `end_date`: Date (optional)
- `description`: Text (optional)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Resources Table
- `id`: Integer (Primary Key)
- `project_id`: Integer (Foreign Key)
- `name`: String
- `type`: String
- `allocation_percentage`: Decimal (0-100)
- `start_date`: Date
- `end_date`: Date (optional)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## API Endpoints

### Projects
- `GET /api/projects` - List all projects (optional status filter)
- `GET /api/projects/[id]` - Get single project with resources
- `POST /api/projects` - Create new project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Resources
- `GET /api/resources` - List all resources (optional project_id filter)
- `GET /api/resources/[id]` - Get single resource
- `POST /api/resources` - Create new resource
- `PUT /api/resources/[id]` - Update resource
- `DELETE /api/resources/[id]` - Delete resource

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Features Overview

### Dashboard
- Total projects count
- Active projects count
- Total resources count
- Over-allocated resources warning (>100% allocation)
- Projects breakdown by status
- Recent projects display

### Project Management
- Create new projects with details
- Filter projects by status
- View project details with assigned resources
- Update project information
- Delete projects (cascades to resources)

### Resource Management
- Add resources to projects
- Track allocation percentages
- Set start and end dates
- View all resources in a table format
- Delete resources from projects

## Data Persistence

All data is stored in a local DuckDB file at `./data/projects.duckdb`. This file is:
- Created automatically on first run
- Persisted between application restarts
- Excluded from git (in `.gitignore`)
- Can be backed up manually

## Development Notes

- The database is initialized automatically on first run
- Run `npm run seed` to populate with sample data (only works on empty database)
- DuckDB is configured as an external dependency in Next.js webpack config
- All database operations are server-side only (API routes)

## License

ISC
