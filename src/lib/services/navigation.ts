import { goto } from '$app/navigation';
import type { ViewType, NavigationState, WorkspaceData } from '$lib/types';

export class NavigationService {
	/**
	 * Updates the URL with the given navigation parameters
	 */
    static updateURL(
        navigation: NavigationState,
        options?: {
            workspaceId?: string;
            replaceState?: boolean;
            noScroll?: boolean;
        }
    ): void {
        const params = new URLSearchParams();

        if (options?.workspaceId) {
            params.set('workspace', options.workspaceId);
        }

        params.set('view', navigation.currentView);

        if (navigation.currentView === 'perspective' && navigation.currentPerspectiveId) {
            params.set('perspective', navigation.currentPerspectiveId);
        }

        if (navigation.currentView === 'project' && navigation.currentProjectId) {
            params.set('project', navigation.currentProjectId);
        }

        const replaceState = options?.replaceState ?? true;
        const noScroll = options?.noScroll ?? true;

        goto(`?${params.toString()}`, { replaceState, noScroll });
    }

	/**
	 * Updates the URL only if it would change from the current URL
	 */
    static updateURLIfChanged(
        currentSearchParams: URLSearchParams,
        navigation: NavigationState,
        options?: {
            workspaceId?: string;
        }
    ): void {
        const params = new URLSearchParams();

        if (options?.workspaceId) {
            params.set('workspace', options.workspaceId);
        }

        params.set('view', navigation.currentView);

        if (navigation.currentView === 'perspective' && navigation.currentPerspectiveId) {
            params.set('perspective', navigation.currentPerspectiveId);
        }

        if (navigation.currentView === 'project' && navigation.currentProjectId) {
            params.set('project', navigation.currentProjectId);
        }

        const target = params.toString();
        const current = currentSearchParams.toString();

        if (target !== current) {
            goto(`?${target}`, { replaceState: true, noScroll: true });
        }
    }

	/**
	 * Parses URL parameters and returns navigation state
	 */
	static parseURLParams(searchParams: URLSearchParams): {
		workspace: string | null;
		view: ViewType | null;
		perspective: string | null;
		project: string | null;
	} {
		return {
			workspace: searchParams.get('workspace'),
			view: searchParams.get('view') as ViewType | null,
			perspective: searchParams.get('perspective'),
			project: searchParams.get('project')
		};
	}

	/**
	 * Validates if a view type is valid
	 */
	static isValidView(view: string | null): view is ViewType {
		return view !== null && ['perspective', 'project', 'project-all', 'all'].includes(view);
	}

	/**
	 * Initializes navigation state from URL parameters
	 * Returns a NavigationState object that can be used to set stores or pass as data
	 */
    static initializeNavigationFromURL(
        urlParams: {
            view: ViewType | null;
            perspective: string | null;
            project: string | null;
        },
        workspaceContext: Pick<WorkspaceData, 'perspectives' | 'projects'>
    ): NavigationState {
        // Default navigation state
        let navigationState: NavigationState = {
            currentView: 'perspective'
        };

		if (NavigationService.isValidView(urlParams.view)) {
			switch (urlParams.view) {
				case 'perspective':
					navigationState.currentView = 'perspective';
                    if (urlParams.perspective && workspaceContext.perspectives.some(p => p.id === urlParams.perspective)) {
						navigationState.currentPerspectiveId = urlParams.perspective;
					} else {
						// Use default perspective as fallback
                        const defaultPerspective = workspaceContext.perspectives[0];
                        if (defaultPerspective) navigationState.currentPerspectiveId = defaultPerspective.id;
					}
					break;
					
				case 'project':
                    if (urlParams.project && workspaceContext.projects.some(p => p.id === urlParams.project)) {
						navigationState.currentView = 'project';
						navigationState.currentProjectId = urlParams.project;
					} else {
						// Fallback to default perspective
						navigationState.currentView = 'perspective';
                        const defaultPerspective = workspaceContext.perspectives[0];
                        if (defaultPerspective) navigationState.currentPerspectiveId = defaultPerspective.id;
					}
					break;
					
				case 'project-all':
					navigationState.currentView = 'project-all';
					break;
					
				case 'all':
					navigationState.currentView = 'all';
					break;
			}
		} else {
			// No valid view in URL, use default perspective
            const defaultPerspective = workspaceContext.perspectives[0];
            if (defaultPerspective) navigationState.currentPerspectiveId = defaultPerspective.id;
		}

		return navigationState;
	}
}