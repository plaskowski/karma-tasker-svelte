import { db } from '$lib/api/localStorageAdapter';
import { 
  toDomainTask, 
  toDomainTasks,
  toCreateTaskRequest, 
  toUpdateTaskRequest 
} from '$lib/api/mappers';
import type { Task } from '$lib/types';

/**
 * Service layer for data operations.
 * Handles mapping between domain models and DTOs.
 */
export class DataService {
  // Task operations
  static async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Promise<Task> {
    const request = toCreateTaskRequest(task);
    const dto = await db.createTask(request);
    return toDomainTask(dto);
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const request = toUpdateTaskRequest(updates);
    const dto = await db.updateTask(id, request);
    return toDomainTask(dto);
  }

  static async deleteTask(id: string): Promise<void> {
    await db.deleteTask(id);
  }

  static async toggleTaskComplete(id: string): Promise<Task> {
    // First get the task to know its current state
    const taskDto = await db.getTask(id);
    if (!taskDto) {
      throw new Error(`Task ${id} not found`);
    }
    
    // Toggle the completed state
    const request = toUpdateTaskRequest({ completed: !taskDto.completed });
    const updatedDto = await db.updateTask(id, request);
    return toDomainTask(updatedDto);
  }

  // Utility operations
  static async resetToDefaults(): Promise<void> {
    await db.resetToDefaults();
  }

  static async exportData(): Promise<{ 
    workspaces: any[]; 
    projects: any[]; 
    tasks: Task[] 
  }> {
    const data = await db.exportData();
    return {
      workspaces: data.workspaces, // Keep as DTOs for now
      projects: data.projects,     // Keep as DTOs for now
      tasks: toDomainTasks(data.tasks)
    };
  }
}