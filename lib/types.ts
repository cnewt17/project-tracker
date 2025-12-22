export interface Project {
  id: number;
  name: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  start_date: string;
  end_date: string | null;
  description: string | null;
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
    Planning: number;
    Active: number;
    'On Hold': number;
    Completed: number;
  };
}

export type CreateProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateResourceInput = Omit<Resource, 'id' | 'created_at' | 'updated_at'>;
export type UpdateResourceInput = Partial<CreateResourceInput>;
