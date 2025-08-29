import { db } from '$lib/api/persistence/localStorageAdapter';
import { toDomainWorkspace, toDomainTasks, toDomainProjects, toDomainPerspective } from '$lib/api/persistence/mappers';
import type { Workspace, Task, WorkspaceData, WorkspaceInfo } from '$lib/types';

export class WorkspaceService {
	/**
	 * Load all workspaces with their perspectives
	 */
    async getAllWorkspaces(): Promise<WorkspaceInfo[]> {
		const workspaceDtos = await db.getWorkspaces();
		
        const allWorkspaces: WorkspaceInfo[] = [];
		for (const dto of workspaceDtos) {
			const wsApi = db.forWorkspace(dto.id);
			const perspectiveDtos = await wsApi.getPerspectives();
			const perspectives = perspectiveDtos.map(toDomainPerspective);
            const ws = toDomainWorkspace(dto, perspectives);
            allWorkspaces.push({ id: ws.id, name: ws.name });
		}
		
		return allWorkspaces;
	}
	
	/**
	 * Build WorkspaceContext for a specific workspace ID
	 */
    async getWorkspaceById(workspaceId: string, allWorkspaces: WorkspaceInfo[]): Promise<{ workspaceContext: WorkspaceData; tasks: Task[] }> {
		// Get current workspace
        const currentWorkspace = allWorkspaces.find(w => w.id === workspaceId);
		if (!currentWorkspace) {
			throw new Error(`Workspace ${workspaceId} not found`);
		}
		
		// Load workspace-specific data
		const wsApi = db.forWorkspace(workspaceId);
		const [projectDtos, taskDtos, perspectiveDtos] = await Promise.all([
			wsApi.getProjects(),
			wsApi.getTasks(),
			wsApi.getPerspectives()
		]);
		
		// Convert to domain models
		const workspaceProjectsData = toDomainProjects(projectDtos, workspaceId)
			.sort((a, b) => a.order - b.order);
		const allTasks = toDomainTasks(taskDtos, workspaceId);
		
		const workspacePerspectivesData = perspectiveDtos
			.map(toDomainPerspective)
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		
        // Create workspace data
        const workspaceContext: WorkspaceData = {
            id: currentWorkspace.id,
            name: currentWorkspace.name,
            projects: workspaceProjectsData,
            perspectives: workspacePerspectivesData
        };
		
		return {
			workspaceContext,
			tasks: allTasks
		};
	}
}

// Export singleton instance
export const workspaceService = new WorkspaceService();