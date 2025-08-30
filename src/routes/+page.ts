import type { PageLoad } from './$types';
import { NavigationService } from '$lib/services/navigation';
import { workspaceService } from '$lib/services/workspaceService';

// This is a client-side only app - disable SSR
export const ssr = false;

export const load: PageLoad = async ({ url }) => {
	// Parse URL parameters
	const urlParams = NavigationService.parseURLParams(url.searchParams);
	
	// Load all workspaces first
    const allWorkspaces = await workspaceService.getAllWorkspaces();
	
	// Handle empty state - no workspaces
	if (allWorkspaces.length === 0) {
		return {
			workspaces: [],
			workspaceContext: {
				workspace: { id: '', name: '', createdAt: new Date() },
				perspectives: [],
				projects: []
			},
			tasks: [],
			navigation: {
				currentView: 'all' as const,
				currentPerspectiveId: null,
				currentProjectId: null
			}
		};
	}
	
	// Determine current workspace ID from URL, localStorage, or default to first
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
            workspaceId = allWorkspaces[0].id;
		}
	}
	
	// Load workspace-specific data
    const { workspaceContext, tasks } = await workspaceService.getWorkspaceById(workspaceId, allWorkspaces);
	
	// Initialize navigation state from URL (no store updates needed)
    const navigationState = NavigationService.initializeNavigationFromURL(
        urlParams,
        { perspectives: workspaceContext.perspectives, projects: workspaceContext.projects }
    );
	
	// Filter tasks based on navigation
	let workspaceTasks = tasks; // Already filtered by workspace
	
	// Apply view-specific filtering
    if (navigationState.currentView === 'perspective') {
		const perspectiveId = navigationState.currentPerspectiveId;
        if (!perspectiveId) {
            throw new Error('Perspective ID is required for perspective view');
        }
        const perspectives = workspaceContext.perspectives;
        const isKnownPerspective = perspectives.some(p => p.id === perspectiveId);
        if (!isKnownPerspective) {
            throw new Error(`Unknown perspective ID: ${perspectiveId}`);
        }
		workspaceTasks = workspaceTasks.filter(task => task.perspectiveId === perspectiveId);
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
		workspaceContext: workspaceContext,
		tasks: workspaceTasks,
		navigation: navigationState
	};
};