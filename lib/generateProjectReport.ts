import { ProjectReportData } from "./types";

export function generateProjectReportHTML(data: ProjectReportData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Report - ${data.metadata.reportDate}</title>
  <style>
    ${generateCSS()}
  </style>
</head>
<body>
  <div class="container">
    ${generateHeader(data.metadata)}
    ${generateKPIs(data.kpis)}
    ${generateActiveProjectsSection(data.activeProjects)}
    ${generatePendingProjectsSection(data.pendingProjects)}
  </div>
</body>
</html>
  `.trim();
}

function generateCSS(): string {
  return `
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --background: #f8fafc;
      --foreground: #0f172a;
      --card: #ffffff;
      --border: #e2e8f0;
      --accent: #3b82f6;
      --muted: #64748b;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --background: #0f172a;
        --foreground: #f8fafc;
        --card: #1e293b;
        --border: #334155;
        --accent: #60a5fa;
        --muted: #94a3b8;
      }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: var(--background);
      color: var(--foreground);
      padding: 2rem;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      margin-bottom: 3rem;
      text-align: center;
      padding-bottom: 2rem;
      border-bottom: 2px solid var(--border);
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--foreground);
    }

    .timestamp {
      font-size: 1rem;
      color: var(--muted);
    }

    /* KPI Section */
    .kpis {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    @media (min-width: 768px) {
      .kpis {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .kpi-card {
      background: var(--card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 2px solid;
      transition: transform 0.2s;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
    }

    .kpi-card.active {
      border-color: #86efac;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    .kpi-card.blocked {
      border-color: #fca5a5;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    }

    .kpi-card.pending {
      border-color: #fcd34d;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    }

    @media (prefers-color-scheme: dark) {
      .kpi-card.active {
        background: rgba(20, 83, 45, 0.2);
        border-color: #166534;
      }

      .kpi-card.blocked {
        background: rgba(127, 29, 29, 0.2);
        border-color: #991b1b;
      }

      .kpi-card.pending {
        background: rgba(120, 53, 15, 0.2);
        border-color: #92400e;
      }
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .kpi-icon {
      font-size: 2rem;
    }

    .kpi-title {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
    }

    .kpi-value {
      font-size: 3rem;
      font-weight: 700;
      line-height: 1;
    }

    .kpi-card.active .kpi-value {
      color: #166534;
    }

    .kpi-card.blocked .kpi-value {
      color: #991b1b;
    }

    .kpi-card.pending .kpi-value {
      color: #92400e;
    }

    @media (prefers-color-scheme: dark) {
      .kpi-card.active .kpi-value {
        color: #86efac;
      }

      .kpi-card.blocked .kpi-value {
        color: #fca5a5;
      }

      .kpi-card.pending .kpi-value {
        color: #fcd34d;
      }
    }

    /* Sections */
    .section {
      margin-bottom: 3rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--border);
    }

    .section-icon {
      font-size: 1.5rem;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--foreground);
    }

    /* Table */
    .table-container {
      background: var(--card);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: var(--border);
    }

    @media (prefers-color-scheme: dark) {
      thead {
        background: #1e293b;
      }
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--foreground);
    }

    td {
      padding: 1rem;
      border-top: 1px solid var(--border);
    }

    tbody tr:hover {
      background: var(--border);
      opacity: 0.7;
    }

    .project-name {
      font-weight: 600;
      color: var(--foreground);
    }

    .rag-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      border: 1px solid;
    }

    .rag-badge.red {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fca5a5;
    }

    .rag-badge.amber {
      background: #fffbeb;
      color: #92400e;
      border-color: #fcd34d;
    }

    .rag-badge.green {
      background: #f0fdf4;
      color: #166534;
      border-color: #86efac;
    }

    .rag-badge.na {
      background: #f8fafc;
      color: #475569;
      border-color: #cbd5e1;
    }

    @media (prefers-color-scheme: dark) {
      .rag-badge.red {
        background: rgba(127, 29, 29, 0.2);
        color: #fca5a5;
        border-color: #991b1b;
      }

      .rag-badge.amber {
        background: rgba(120, 53, 15, 0.2);
        color: #fcd34d;
        border-color: #92400e;
      }

      .rag-badge.green {
        background: rgba(20, 83, 45, 0.2);
        color: #86efac;
        border-color: #166534;
      }

      .rag-badge.na {
        background: rgba(30, 41, 59, 0.2);
        color: #cbd5e1;
        border-color: #475569;
      }
    }

    .rag-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .rag-badge.red .rag-dot {
      background: #ef4444;
    }

    .rag-badge.amber .rag-dot {
      background: #f59e0b;
    }

    .rag-badge.green .rag-dot {
      background: #10b981;
    }

    .rag-badge.na .rag-dot {
      background: #94a3b8;
    }

    .comment {
      font-style: italic;
      color: var(--muted);
      font-size: 0.875rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--muted);
      background: var(--card);
      border-radius: 12px;
      border: 1px dashed var(--border);
    }

    /* Pending Projects List */
    .pending-list {
      background: var(--card);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border);
    }

    .pending-list ul {
      list-style: none;
      padding: 0;
    }

    .pending-list li {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .pending-list li:last-child {
      border-bottom: none;
    }

    .pending-project-name {
      flex: 1;
      font-weight: 500;
      color: var(--foreground);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      white-space: nowrap;
      border: 1px solid;
    }

    .status-badge.ready {
      background: #eff6ff;
      color: #1e40af;
      border-color: #93c5fd;
    }

    .status-badge.pending-sale {
      background: #fffbeb;
      color: #92400e;
      border-color: #fcd34d;
    }

    .status-badge.sales-pipeline {
      background: #faf5ff;
      color: #581c87;
      border-color: #d8b4fe;
    }

    .status-badge.active {
      background: #f0fdf4;
      color: #166534;
      border-color: #86efac;
    }

    .status-badge.blocked {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fca5a5;
    }

    @media (prefers-color-scheme: dark) {
      .status-badge.ready {
        background: rgba(30, 58, 138, 0.2);
        color: #93c5fd;
        border-color: #1e40af;
      }

      .status-badge.pending-sale {
        background: rgba(120, 53, 15, 0.2);
        color: #fcd34d;
        border-color: #92400e;
      }

      .status-badge.sales-pipeline {
        background: rgba(88, 28, 135, 0.2);
        color: #d8b4fe;
        border-color: #7e22ce;
      }

      .status-badge.active {
        background: rgba(20, 83, 45, 0.2);
        color: #86efac;
        border-color: #166534;
      }

      .status-badge.blocked {
        background: rgba(127, 29, 29, 0.2);
        color: #fca5a5;
        border-color: #991b1b;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      .header h1 {
        font-size: 1.75rem;
      }

      table {
        font-size: 0.875rem;
      }

      th, td {
        padding: 0.75rem 0.5rem;
      }

      .kpi-value {
        font-size: 2.5rem;
      }
    }

    /* Print styles */
    @media print {
      body {
        background: white;
        color: black;
      }

      .kpi-card {
        break-inside: avoid;
      }

      table {
        break-inside: avoid;
      }
    }
  `.trim();
}

function generateHeader(metadata: any): string {
  return `
    <header class="header">
      <h1>Project Status Report</h1>
      <p class="timestamp">Generated: ${metadata.reportDate}</p>
    </header>
  `;
}

function generateKPIs(kpis: any): string {
  return `
    <div class="kpis">
      <div class="kpi-card active">
        <div class="kpi-header">
          <span class="kpi-icon">🚀</span>
          <span class="kpi-title">Active</span>
        </div>
        <div class="kpi-value">${kpis.activeProjects}</div>
      </div>

      <div class="kpi-card blocked">
        <div class="kpi-header">
          <span class="kpi-icon">🚫</span>
          <span class="kpi-title">Blocked</span>
        </div>
        <div class="kpi-value">${kpis.blockedProjects}</div>
      </div>

      <div class="kpi-card pending">
        <div class="kpi-header">
          <span class="kpi-icon">⏳</span>
          <span class="kpi-title">Pending</span>
        </div>
        <div class="kpi-value">${kpis.pendingProjects}</div>
      </div>
    </div>
  `;
}

function generateActiveProjectsSection(projects: any[]): string {
  if (projects.length === 0) {
    return `
      <section class="section">
        <div class="section-header">
          <span class="section-icon">🚀</span>
          <h2 class="section-title">Active Projects</h2>
        </div>
        <div class="empty-state">
          <p>No active projects</p>
        </div>
      </section>
    `;
  }

  const rows = projects
    .map(
      (project) => `
    <tr>
      <td class="project-name">${escapeHtml(truncate(project.name, 80))}</td>
      <td>${generateStatusBadge(project.status)}</td>
      <td>${formatDate(project.endDate)}</td>
      <td>${generateRagBadge(project.ragStatus)}</td>
      <td class="comment">${escapeHtml(truncate(project.latestComment || "No updates", 150))}</td>
    </tr>
  `,
    )
    .join("");

  return `
    <section class="section">
      <div class="section-header">
        <span class="section-icon">🚀</span>
        <h2 class="section-title">Active Projects</h2>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Project Status</th>
              <th>End Date</th>
              <th>RAG Status</th>
              <th>Latest Update</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function generatePendingProjectsSection(projects: any[]): string {
  if (projects.length === 0) {
    return `
      <section class="section">
        <div class="section-header">
          <span class="section-icon">⏳</span>
          <h2 class="section-title">Pending Projects</h2>
        </div>
        <div class="empty-state">
          <p>No pending projects</p>
        </div>
      </section>
    `;
  }

  const items = projects
    .map(
      (project) => `
    <li>
      <span class="pending-project-name">${escapeHtml(project.name)}</span>
      ${generateStatusBadge(project.status)}
    </li>
  `,
    )
    .join("");

  return `
    <section class="section">
      <div class="section-header">
        <span class="section-icon">⏳</span>
        <h2 class="section-title">Pending Projects</h2>
      </div>
      <div class="pending-list">
        <ul>
          ${items}
        </ul>
      </div>
    </section>
  `;
}

function generateRagBadge(status: string): string {
  const statusMap: { [key: string]: { class: string; label: string } } = {
    Red: { class: "red", label: "Red" },
    Amber: { class: "amber", label: "Amber" },
    Green: { class: "green", label: "Green" },
    "N/A": { class: "na", label: "N/A" },
  };

  const config = statusMap[status] || statusMap["N/A"];

  return `
    <span class="rag-badge ${config.class}">
      <span class="rag-dot"></span>
      ${config.label}
    </span>
  `;
}

function generateStatusBadge(status: string): string {
  const statusMap: { [key: string]: { class: string; label: string } } = {
    Ready: { class: "ready", label: "Ready" },
    "Pending Sale Confirmation": {
      class: "pending-sale",
      label: "Awaiting Confirmation",
    },
    "Sales Pipeline": { class: "sales-pipeline", label: "Sales Pipeline" },
    Active: { class: "active", label: "Active" },
    Blocked: { class: "blocked", label: "Blocked" },
  };

  const config = statusMap[status] || { class: "ready", label: status };

  return `
    <span class="status-badge ${config.class}">
      ${config.label}
    </span>
  `;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "No end date";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
