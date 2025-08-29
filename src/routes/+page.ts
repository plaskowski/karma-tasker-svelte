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
	const currentWorkspaceContext = get(workspaceContext);
	
	// Initialize workspace from URL or use current
	if (urlParams.workspace && currentWorkspaces.some(w => w.id === urlParams.workspace)) {
		setCurrentWorkspace(urlParams.workspace);
	}
	
	// Initialize navigation state from URL
	if (NavigationService.isValidView(urlParams.view)) {
		switch (urlParams.view) {
			case 'perspective':
				if (urlParams.perspective && currentWorkspaceContext.hasPerspective(urlParams.perspective)) {
					navigation.setPerspectiveView(urlParams.perspective);
				} else {
					// Use default perspective as fallback
					const defaultPerspective = currentWorkspaceContext.getDefaultPerspective();
					if (defaultPerspective) {
						navigation.setPerspectiveView(defaultPerspective.id);
					}
				}
				break;
				
			case 'project':
				if (urlParams.project && currentWorkspaceContext.hasProject(urlParams.project)) {
					navigation.setProjectView(urlParams.project);
				} else {
					// Fallback to default perspective
					const defaultPerspective = currentWorkspaceContext.getDefaultPerspective();
					if (defaultPerspective) {
						navigation.setPerspectiveView(defaultPerspective.id);
					}
				}
				break;
				
			case 'project-all':
				navigation.setProjectAllView();
				break;
				
			case 'all':
				navigation.setAllView();
				break;
		}
	} else {
		// No valid view in URL, use default perspective
		const defaultPerspective = currentWorkspaceContext.getDefaultPerspective();
		if (defaultPerspective) {
			navigation.setPerspectiveView(defaultPerspective.id);
		}
	}
	
	// Return initial data for the page
	return {
		initialWorkspaceId: currentWorkspaceContext.getId(),
		initialNavigation: get(navigation)
	};
};