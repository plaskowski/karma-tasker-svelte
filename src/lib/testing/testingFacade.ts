/**
 * Testing facade to provide controlled access to application state during tests
 * This avoids direct localStorage manipulation from tests
 */

import { db } from '$lib/api/persistence/localStorageAdapter';
import type { Task } from '$lib/types';
import { toDomainTasks } from '$lib/api/persistence/mappers';
import { mockTasks, mockProjects, mockWorkspaces } from '$lib/data/mockData';
import { toTaskDto, toProjectDto, toWorkspaceDto } from '$lib/api/persistence/mappers';

export interface TestingFacade {
	// Clear all data for empty state testing
	clearAllData: () => void;
	// Load mock data into localStorage
	loadMockData: () => Promise<void>;
	// Delete all tasks while keeping projects and workspaces
	deleteAllTasks: () => Promise<void>;
	// Complete half of tasks from specified workspace and perspective
	completeHalfOfTasks: (workspaceId?: string, perspective?: string) => Promise<void>;
}

/**
 * Create the testing facade implementation
 */
export function createTestingFacade(): TestingFacade {
	return {
		clearAllData() {
			// Clear all karma-tasks localStorage keys
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith('karma-tasks-')) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach(key => localStorage.removeItem(key));
		},
		async loadMockData() {
			// Clear existing data first
			this.clearAllData();
			
			// Add workspaces and their perspectives
			for (const workspace of mockWorkspaces) {
				// Create workspace
				await db.createWorkspace(toWorkspaceDto(workspace));
				
				// Add perspectives using the API
				const wsApi = db.forWorkspace(workspace.id);
				for (const perspective of workspace.perspectives) {
					await wsApi.createPerspective({
						id: perspective.id,
						name: perspective.name,
						icon: perspective.icon,
						order: perspective.order
					});
				}
			}
			
			// Add projects to personal workspace
			const personalWs = db.forWorkspace('personal');
			for (const project of mockProjects) {
				if (project.workspaceId === 'personal') {
					await personalWs.createProject(toProjectDto(project));
				}
			}
			
			// Add tasks to personal workspace
			for (const task of mockTasks) {
				await personalWs.createTask(toTaskDto(task));
			}
		},
		async deleteAllTasks() {
			// Get all workspaces
			const workspaceDtos = await db.getWorkspaces();
			
			// Delete tasks from each workspace
			for (const workspace of workspaceDtos) {
				const wsApi = db.forWorkspace(workspace.id);
				const taskDtos = await wsApi.getTasks();
				
				// Delete each task
				for (const task of taskDtos) {
					await wsApi.deleteTask(task.id);
				}
			}
		},
		async completeHalfOfTasks(workspaceId?: string, perspective?: string) {
			// Default to personal workspace if not specified
			const targetWorkspace = workspaceId || 'personal';
			
			// Get tasks from the workspace
			const wsApi = db.forWorkspace(targetWorkspace);
			const taskDtos = await wsApi.getTasks();
			const allTasks = toDomainTasks(taskDtos);
			
			// Filter tasks based on criteria
			let eligibleTasks = allTasks.filter((task: Task) => {
				if (task.completed) return false; // Skip already completed
				if (perspective && task.perspectiveId !== perspective) return false;
				return true;
			});
			
			// Complete half of the eligible tasks (at least 1, round up)
			const tasksToComplete = Math.max(1, Math.ceil(eligibleTasks.length / 2));
			
			// Complete the tasks using the API
			for (let i = 0; i < tasksToComplete && i < eligibleTasks.length; i++) {
				await wsApi.updateTask(eligibleTasks[i].id, { completed: true });
			}
		}
	};
}

/**
 * Initialize testing facade on window object (only in dev/test environments)
 */
export function initializeTestingFacade() {
	if (typeof window !== 'undefined') {
		// Only expose in development or test environments
		const isDev = import.meta.env.DEV;
		const isTest = import.meta.env.MODE === 'test' || window.location.hostname === 'localhost';
		
		if (isDev || isTest) {
			(window as any).__testingFacade = createTestingFacade();
		}
	}
}