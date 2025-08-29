import type { PageLoad } from './$types';
import { NavigationService } from '$lib/services/navigation';
import { get } from 'svelte/store';
import { 
	workspaces, 
	tasks, 
	projects
} from '$lib/stores/taskStore';
import { WorkspaceContextImpl } from '$lib/models/WorkspaceContext';
import type { Task, Project, PerspectiveConfig, Workspace } from '$lib/types';

export const load: PageLoad = async ({ url }) => {
	// Parse URL parameters
	const urlParams = NavigationService.parseURLParams(url.searchParams);
	
	// Load all data from stores
	const allWorkspaces = get(workspaces);
	const allTasks = get(tasks);
	const allProjects = get(projects);
	
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
	
	// Filter projects and perspectives for current workspace
	const workspaceProjectsData = allProjects
		.filter(project => project.workspaceId === workspaceId)
		.sort((a, b) => a.order - b.order);
	
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
	let workspaceTasks = allTasks.filter(task => task.workspaceId === workspaceId);
	
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