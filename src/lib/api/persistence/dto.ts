/**
 * Data Transfer Objects (DTOs) for the persistence layer.
 * These types represent entities as stored/transmitted,
 * using snake_case for API compatibility.
 */

export interface WorkspaceDto {
  id: string;
  name: string;
  created_at: string; // ISO date string
}

export interface PerspectiveDto {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface ProjectDto {
  id: string;
  name: string;
  order: number;
  icon: string;
  created_at: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  perspective: string;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}