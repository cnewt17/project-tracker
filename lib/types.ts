export interface Project {
  id: number;
  name: string;
  status:
    | "Completed"
    | "Active"
    | "Blocked"
    | "Ready"
    | "Pending Sale Confirmation"
    | "Cancelled"
    | "Sales Pipeline";
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  archived: boolean;
  rag_status: "Red" | "Amber" | "Green" | "N/A";
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  project_id: number;
  name: string;
  type: string;
  allocation_percentage: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalResources: number;
  overAllocatedResources: number;
  projectsByStatus: {
    Completed: number;
    Active: number;
    Blocked: number;
    Ready: number;
    "Pending Sale Confirmation": number;
    Cancelled: number;
    "Sales Pipeline": number;
  };
}

export type CreateProjectInput = Omit<
  Project,
  "id" | "created_at" | "updated_at"
>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateResourceInput = Omit<
  Resource,
  "id" | "created_at" | "updated_at"
>;
export type UpdateResourceInput = Partial<CreateResourceInput>;

export interface Milestone {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  due_date: string;
  status: "pending" | "in_progress" | "completed";
  progress: number;
  created_at: string;
  updated_at: string;
}

export type CreateMilestoneInput = Omit<
  Milestone,
  "id" | "created_at" | "updated_at"
>;
export type UpdateMilestoneInput = Partial<CreateMilestoneInput>;

export interface ProjectStatusUpdate {
  id: number;
  project_id: number;
  rag_status: "Red" | "Amber" | "Green" | "N/A";
  comment: string | null;
  created_at: string;
}

export type CreateProjectStatusUpdateInput = Omit<
  ProjectStatusUpdate,
  "id" | "created_at"
>;

export interface ProjectReportData {
  metadata: {
    generatedAt: string;
    reportDate: string;
  };
  kpis: {
    activeProjects: number;
    blockedProjects: number;
    pendingProjects: number;
  };
  activeProjects: Array<{
    id: number;
    name: string;
    endDate: string | null;
    ragStatus: string;
    latestComment: string | null;
  }>;
  pendingProjects: Array<{
    id: number;
    name: string;
    status: string;
  }>;
  resources: Array<{
    name: string;
    projects: Array<{
      projectName: string;
      allocation: number;
      endDate: string | null;
    }>;
  }>;
}

export interface ResourceAllocation {
  name: string;
  types: string;
  current_allocation: number;
  project_count: number;
  active_project_count: number;
  is_over_allocated: boolean;
  projects: Array<{
    project_id: number;
    project_name: string;
    allocation: number;
    start_date: string;
    end_date: string | null;
    project_status: string;
    is_active: boolean;
  }>;
  earliest_start: string | null;
  latest_end: string | null;
}
