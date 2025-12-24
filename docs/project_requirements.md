# Project Resource Tracking Application - Requirements Document

## Overview
A Next.js application for tracking projects and their resource allocation, designed to run locally with potential for future deployment. The application uses DuckDB as an embedded database for data persistence.

## Technical Stack
- **Framework:** Next.js (latest stable version)
- **Database:** DuckDB (embedded database, file-based)
- **Language:** TypeScript
- **Styling:** TailwindCSS (or your preferred styling solution)
- **Database Library:** `duckdb-async` or `duckdb`

## Architecture

### Database Architecture
- **Type:** Embedded database (no separate server process required)
- **Storage:** Single `.duckdb` file stored locally (e.g., `./data/projects.duckdb`)
- **Access Pattern:** Direct in-process queries through DuckDB library
- **Location:** Database operations only in server-side code (API routes, server components)

### Application Structure
```
/pages
  /api
    /projects
    /resources
/lib
  db.ts              # Database connection and initialization
  /models            # Data models and queries
/components          # React components
/data
  projects.duckdb    # Database file (created on first run)
```

## Core Features

### 1. Project Management
**Requirements:**
- Create, read, update, and delete projects
- Each project should have:
  - Unique ID (auto-generated)
  - Project name
  - Status (e.g., "Planning", "Active", "On Hold", "Completed")
  - Start date
  - End date (optional)
  - Description (optional)
  - Created/updated timestamps
  - Milestones (optional)

**User Stories:**
- As a user, I can create a new project with basic information
- As a user, I can view a list of all projects
- As a user, I can edit project details
- As a user, I can delete a project
- As a user, I can filter projects by status
- As a user, I can create/edit/delete milestones for a project
- As a user, I can track milestone status (in progress, completed)
- As a user, I can set milestone due dates
- As a user, I can view milestone progress bars

### 2. Resource Management
**Requirements:**
- Track resources assigned to projects
- Each resource should have:
  - Unique ID (auto-generated)
  - Resource name (person, team, or asset)
  - Resource type (e.g., "Developer", "Designer", "Equipment")
  - Allocation percentage (0-100%)
  - Project association (foreign key to projects)
  - Start date
  - End date (optional)
  - Created/updated timestamps

**User Stories:**
- As a user, I can add resources to a project
- As a user, I can view all resources for a specific project
- As a user, I can update resource allocation
- As a user, I can remove resources from a project
- As a user, I can see total resource allocation across all projects

### 3. Dashboard/Overview
**Requirements:**
- Summary view of all projects and resources
- Key metrics:
  - Total number of active projects
  - Total resources allocated
  - Projects by status (breakdown)
  - Over-allocated resources (>100% allocation)

**User Stories:**
- As a user, I can see a dashboard with key metrics at a glance
- As a user, I can identify resource conflicts or over-allocations

## Database Schema

### Projects Table
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Resources Table
```sql
CREATE TABLE resources (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  allocation_percentage DECIMAL(5,2) NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects (with optional status filter)
- `GET /api/projects/[id]` - Get single project with resources
- `POST /api/projects` - Create new project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Resources
- `GET /api/resources` - List all resources (with optional project_id filter)
- `GET /api/resources/[id]` - Get single resource
- `POST /api/resources` - Create new resource
- `PUT /api/resources/[id]` - Update resource
- `DELETE /api/resources/[id]` - Delete resource

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## UI Requirements

### Pages/Views
1. **Dashboard (Home)** - Overview with key metrics and recent projects
2. **Projects List** - Table/grid view of all projects with filters
3. **Project Detail** - Single project view with associated resources
4. **Create/Edit Project** - Form for project creation and editing
5. **Create/Edit Resource** - Form for resource creation and editing

### UI Components Needed
- Navigation header
- Project card/list item
- Resource card/list item
- Form components (input, select, date picker)
- Modal/dialog for create/edit operations
- Statistics cards for dashboard
- Table component for list views
- Filter/search components

## Data Initialization

### First Run
- Application should check if database file exists
- If not, create database file and initialize schema
- Optionally seed with sample data for testing

### Optional CSV Import (Future Enhancement)
- Ability to import initial data from CSV files
- CSV format should match database schema
- Import should be a one-time operation or manual trigger

## Non-Functional Requirements

### Performance
- Database operations should be fast (in-memory queries with DuckDB)
- UI should be responsive and provide loading states

### Data Persistence
- All data must persist between application restarts
- Database file should be backed up regularly (user responsibility)

### Error Handling
- Graceful error handling for database operations
- User-friendly error messages
- Validation on both client and server side

### Security (for future deployment)
- Input validation and sanitization
- SQL injection prevention (use parameterized queries)
- Authentication/authorization (future consideration)

## Development Considerations

### Database Connection
- Implement singleton pattern for database connection
- Initialize database and schema on first connection
- Handle connection errors gracefully

### Server-Side Only
- All DuckDB operations must be server-side
- Use API routes for all database interactions
- Client components fetch data through API

### File Management
- Ensure `./data` directory exists or is created programmatically
- `.duckdb` file should be in `.gitignore`
- Consider providing a `.duckdb.example` or seed script

## Future Enhancements (Out of Scope for MVP)
- CSV export functionality
- Resource utilization charts/graphs
- Email notifications for over-allocation
- Multi-user support with authentication
- Project templates
- Time tracking integration
- Budget tracking
- File attachments for projects

## Success Criteria
- User can create, view, update, and delete projects
- User can assign and manage resources for projects
- Data persists between application restarts
- Application runs locally without external dependencies
- Dashboard provides clear overview of project status
- Resource allocation can be tracked and over-allocation identified

## Testing Recommendations
- Unit tests for database queries and API endpoints
- Integration tests for API routes
- E2E tests for critical user flows
- Test data persistence across restarts

---

**Document Version:** 1.0  
**Last Updated:** December 19, 2025  
**Status:** Ready for Implementation
