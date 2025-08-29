import type { PageLoad } from './$types';
import { NavigationService } from '$lib/services/navigation';
import { db } from '$lib/api/persistence/localStorageAdapter';
import { toDomainWorkspace, toDomainTasks, toDomainProjects, toDomainPerspective } from '$lib/api/persistence/mappers';
import { WorkspaceContextImpl } from '$lib/models/WorkspaceContext';
import type { Workspace } from '$lib/types';

export const load: PageLoad = async ({ url }) => {
	// Parse URL parameters
	const urlParams = NavigationService.parseURLParams(url.searchParams);
	
	// Load workspaces first
	const workspaceDtos = await db.getWorkspaces();
	
	// Convert workspace DTOs to domain models with perspectives
	const allWorkspaces: Workspace[] = [];
	for (const dto of workspaceDtos) {
		const wsApi = db.forWorkspace(dto.id);
		const perspectiveDtos = await wsApi.getPerspectives();
		const perspectives = perspectiveDtos.map(toDomainPerspective);
		allWorkspaces.push(toDomainWorkspace(dto, perspectives));
	}
	
	// Determine current workspace from URL or localStorage fallback
	let workspaceId: string;
	if (urlParams.workspace && allWorkspaces.some(w => w.id === urlParams.workspace)) {
		workspaceId = urlParams.workspace;
		// Save to localStorage for next time
		if (typeof window !== 'undefined') {
			localStorage.setItem('karma-tasks-currentWorkspace', workspaceId);
		}
	} else {
		// Try localStorage fallback
		const savedWorkspace = typeof window !== 'undefined' 
			? localStorage.getItem('karma-tasks-currentWorkspace') 
			: null;
		if (savedWorkspace && allWorkspaces.some(w => w.id === savedWorkspace)) {
			workspaceId = savedWorkspace;
		} else {
			// Default to first workspace
			workspaceId = allWorkspaces[0]?.id || 'personal';
		}
	}
	
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
	const workspaceContextData = new WorkspaceContextImpl(
		currentWorkspace,
		workspaceProjectsData,
		workspacePerspectivesData
	);
	
	// Initialize navigation state from URL (no store updates needed)
	const navigationState = NavigationService.initializeNavigationFromURL(
		urlParams,
		workspaceContextData
	);
	
	// Filter tasks based on navigation
	let workspaceTasks = allTasks; // Already filtered by workspace
	
	// Apply view-specific filtering
	if (navigationState.currentView === 'perspective') {
		const perspectiveId = navigationState.currentPerspectiveId;
		const isKnownPerspective = workspacePerspectivesData.some(p => p.id === perspectiveId);
		const effectivePerspective = isKnownPerspective ? perspectiveId : workspacePerspectivesData[0]?.id;
		workspaceTasks = workspaceTasks.filter(task => task.perspective === effectivePerspective);
	} else if (navigationState.currentView === 'project') {
		if (navigationState.currentProjectId) {
			workspaceTasks = workspaceTasks.filter(task => task.projectId === navigationState.currentProjectId);
		}
	} else if (navigationState.currentView === 'project-all') {
		workspaceTasks = workspaceTasks.filter(task => task.projectId);
	}
	// 'all' view keeps all tasks
	
	// Return all loaded data
	return {
		workspaces: allWorkspaces,
		workspaceContext: workspaceContextData,
		tasks: workspaceTasks,
		navigation: navigationState
	};
};