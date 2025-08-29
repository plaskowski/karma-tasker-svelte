import { db } from '$lib/api/persistence/localStorageAdapter';
import { toDomainWorkspace, toDomainTasks, toDomainProjects, toDomainPerspective } from '$lib/api/persistence/mappers';
import { WorkspaceContextImpl } from '$lib/models/WorkspaceContext';
import type { Workspace, Task } from '$lib/types';
import type { WorkspaceContext } from '$lib/models/WorkspaceContext';

export class WorkspaceService {
	/**
	 * Load all workspaces with their perspectives
	 */
	async getAllWorkspaces(): Promise<Workspace[]> {
		const workspaceDtos = await db.getWorkspaces();
		
		const allWorkspaces: Workspace[] = [];
		for (const dto of workspaceDtos) {
			const wsApi = db.forWorkspace(dto.id);
			const perspectiveDtos = await wsApi.getPerspectives();
			const perspectives = perspectiveDtos.map(toDomainPerspective);
			allWorkspaces.push(toDomainWorkspace(dto, perspectives));
		}
		
		return allWorkspaces;
	}
	
	/**
	 * Build WorkspaceContext for a specific workspace ID
	 */
	async getWorkspaceById(workspaceId: string, allWorkspaces: Workspace[]): Promise<{ workspaceContext: WorkspaceContext; tasks: Task[] }> {
		// Get current workspace
		const currentWorkspace = allWorkspaces.find(w => w.id === workspaceId);
		if (!currentWorkspace) {
			throw new Error(`Workspace ${workspaceId} not found`);
		}
		
		// Load workspace-specific data
		const wsApi = db.forWorkspace(workspaceId);
		const [projectDtos, taskDtos] = await Promise.all([
			wsApi.getProjects(),
			wsApi.getTasks()
		]);
		
		// Convert to domain models
		const workspaceProjectsData = toDomainProjects(projectDtos, workspaceId)
			.sort((a, b) => a.order - b.order);
		const allTasks = toDomainTasks(taskDtos, workspaceId);
		
		const workspacePerspectivesData = (currentWorkspace.perspectives || [])
			.slice()
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		
		// Create workspace context
		const workspaceContext = new WorkspaceContextImpl(
			currentWorkspace,
			workspaceProjectsData,
			workspacePerspectivesData
		);
		
		return {
			workspaceContext,
			tasks: allTasks
		};
	}
}

// Export singleton instance
export const workspaceService = new WorkspaceService();