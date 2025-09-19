import type { NavigationState, Task, WorkspaceData } from "$lib/types";
import { getRequiredTaskDefaults } from "$lib/helpers/workspaceHelpers";
import { db } from "$lib/api/persistence/localStorageAdapter";
import { NavigationService } from "$lib/services/navigation";

export class TaskService {
  /**
   * Creates a new task with defaults based on current context
   */
  static createNewTaskWithDefaults(
    workspaceContext: WorkspaceData,
    navigation: NavigationState,
  ): Task {
    const workspaceDefaults = getRequiredTaskDefaults(workspaceContext);
    return {
      id: "new",
      title: "",
      description: "",
      completed: false,
      projectId:
        NavigationService.getCurrentProjectId(navigation) ||
        workspaceDefaults.projectId,
      perspectiveId:
        NavigationService.getCurrentPerspectiveId(navigation) ||
        workspaceDefaults.perspectiveId,
      order: 0, // Will be calculated when task is actually saved
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Validates task data before saving
   */
  static validateTask(task: Partial<Task>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!task.title || task.title.trim().length === 0) {
      errors.push("Task title is required");
    }

    if (!task.perspectiveId) {
      errors.push("Perspective is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Prepares task data for creation
   */
  static prepareTaskForCreation(taskData: {
    title: string;
    description?: string;
    projectId: string;
    perspectiveId: string;
  }): Omit<Task, "id" | "createdAt" | "updatedAt" | "order"> {
    return {
      title: taskData.title,
      description: taskData.description,
      projectId: taskData.projectId,
      completed: false,
      perspectiveId: taskData.perspectiveId,
    };
  }

  /**
   * Calculates the next order value for a new task
   */
  static calculateNextOrder(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    const maxOrder = Math.max(...tasks.map((t) => t.order || 0));
    return maxOrder + 1;
  }

  /**
   * Sorts tasks by their order property
   */
  static sortTasksByOrder(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Clear all completed tasks from a workspace
   */
  static async clearCompletedTasks(
    workspaceId: string,
    tasks: Task[],
  ): Promise<void> {
    const wsApi = db.forWorkspace(workspaceId);
    const completedTasks = tasks.filter((task) => task.completed);

    // Delete all completed tasks
    for (const task of completedTasks) {
      await wsApi.deleteTask(task.id);
    }
  }
}
