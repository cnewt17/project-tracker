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
