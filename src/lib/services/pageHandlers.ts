import type { ViewType } from '$lib/types';
import type { WorkspaceContext } from '$lib/stores/workspaceContext';
import type { Workspace } from '$lib/types';
import { NavigationService } from './navigation';

/**
 * Handles navigation between different views (perspective, project, all, project-all)
 */
export function handleNavigate(
	view: ViewType,
	workspaceContext: WorkspaceContext,
	options?: { perspectiveId?: string; projectId?: string }
) {
	const workspaceId = workspaceContext.getId();
	
	// Directly update URL, which will trigger load function
	if (view === 'perspective' && options?.perspectiveId) {
		NavigationService.updateURL(view, {
			perspectiveId: options.perspectiveId,
			workspaceId
		});
	} else if (view === 'all') {
		NavigationService.updateURL(view, { workspaceId });
	} else if (view === 'project-all') {
		NavigationService.updateURL(view, { workspaceId });
	} else if (view === 'project' && options?.projectId) {
		NavigationService.updateURL('project', {
			projectId: options.projectId,
			workspaceId
		});
	}
}

/**
 * Handles workspace change and updates navigation accordingly
 */
export function handleWorkspaceChange(
	workspaceId: string,
	workspaceContext: WorkspaceContext,
	currentNavigation: { currentView: ViewType; currentPerspectiveId?: string }
) {
	// Directly update URL based on current view
	// If we're in project view, switch to first perspective since projects are workspace-specific
	if (currentNavigation.currentView === 'project' || currentNavigation.currentView === 'project-all') {
		const firstPerspective = workspaceContext.getDefaultPerspective();
		if (firstPerspective) {
			NavigationService.updateURL('perspective', {
				perspectiveId: firstPerspective.id,
				workspaceId
			});
		}
	} else if (currentNavigation.currentView === 'perspective') {
		// Keep current perspective if it exists in new workspace, otherwise use first
		const perspectiveExists = currentNavigation.currentPerspectiveId ? 
			workspaceContext.hasPerspective(currentNavigation.currentPerspectiveId) : false;
		if (!perspectiveExists) {
			const firstPerspective = workspaceContext.getDefaultPerspective();
			if (firstPerspective) {
				NavigationService.updateURL('perspective', {
					perspectiveId: firstPerspective.id,
					workspaceId
				});
			}
		} else {
			NavigationService.updateURL('perspective', {
				perspectiveId: currentNavigation.currentPerspectiveId,
				workspaceId
			});
		}
	} else {
		// Keep current view for 'all' view
		NavigationService.updateURL(currentNavigation.currentView, {
			workspaceId
		});
	}
}

/**
 * Handles keyboard shortcuts for the application
 * Returns true if the event was handled
 */
export function handleKeyboardShortcut(
	event: KeyboardEvent,
	actions: {
		onNewTask: () => void;
		onEscape?: () => void;
	}
): boolean {
	// Allow Escape to close modals/editors even when focused in inputs
	if (event.key === 'Escape') {
		if (actions.onEscape) {
			actions.onEscape();
			event.preventDefault();
			return true;
		}
		return false;
	}

	// Don't interfere with typing in inputs for other shortcuts
	if (event.target instanceof HTMLInputElement || 
		event.target instanceof HTMLTextAreaElement || 
		event.target instanceof HTMLSelectElement) {
		return false;
	}

	// New task (Ctrl+N or Cmd+N)
	if (event.ctrlKey || event.metaKey) {
		if (event.key === 'n' || event.key === 'N') {
			actions.onNewTask();
			event.preventDefault();
			return true;
		}
	}

	// New task (N key)
	if (event.key === 'n' || event.key === 'N') {
		actions.onNewTask();
		event.preventDefault();
		return true;
	}

	return false;
}

/**
 * Handles refresh/reset action for development
 */
export function handleRefresh(
	workspaces: Workspace[],
	workspaceContext: WorkspaceContext,
	resetToInitialState: () => void
) {
	// Reset app to initial state (temporary dev feature)
	resetToInitialState();
	
	// Update URL to reflect reset state - use first workspace
	if (!workspaces[0]?.id) {
		throw new Error('No workspaces defined. At least one workspace is required.');
	}
	const firstWorkspaceId = workspaces[0].id;
	const firstPerspective = workspaceContext.getDefaultPerspective();
	if (firstPerspective) {
		NavigationService.updateURL('perspective', {
			perspectiveId: firstPerspective.id,
			workspaceId: firstWorkspaceId
		});
	}
}