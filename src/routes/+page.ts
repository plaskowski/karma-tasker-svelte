import type { PageLoad } from './$types';
import { NavigationService } from '$lib/services/navigation';
import { get } from 'svelte/store';
import { workspaces } from '$lib/stores/taskStore';
import { navigation } from '$lib/stores/navigationStore';
import { workspaceContext, setCurrentWorkspace } from '$lib/stores/workspaceContext';

export const load: PageLoad = async ({ url }) => {
	// Parse URL parameters
	const urlParams = NavigationService.parseURLParams(url.searchParams);
	
	// Get current stores state
	const currentWorkspaces = get(workspaces);
	
	// Initialize workspace from URL or use current
	if (urlParams.workspace && currentWorkspaces.some(w => w.id === urlParams.workspace)) {
		setCurrentWorkspace(urlParams.workspace);
	}
	
	// Get workspace context AFTER setting the workspace
	const currentWorkspaceContext = get(workspaceContext);
	
	// Initialize navigation state from URL using the service
	const navigationState = NavigationService.initializeNavigationFromURL(
		urlParams,
		currentWorkspaceContext
	);
	
	// Set the navigation store based on the initialized state
	if (navigationState.currentView === 'perspective' && navigationState.currentPerspectiveId) {
		navigation.setPerspectiveView(navigationState.currentPerspectiveId);
	} else if (navigationState.currentView === 'project' && navigationState.currentProjectId) {
		navigation.setProjectView(navigationState.currentProjectId);
	} else if (navigationState.currentView === 'project-all') {
		navigation.setProjectAllView();
	} else if (navigationState.currentView === 'all') {
		navigation.setAllView();
	}
	
	// Return initial data for the page
	// Note: The app currently uses stores for data management rather than 
	// passing data through load functions. Converting to load-based data
	// would require refactoring all components to accept props instead of
	// subscribing to stores - a major architectural change.
	return {
		initialWorkspaceId: currentWorkspaceContext.getId(),
		initialNavigation: navigationState
	};
};