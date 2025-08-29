import { goto } from '$app/navigation';
import type { ViewType } from '$lib/types';

export class NavigationService {
	/**
	 * Updates the URL with the given navigation parameters
	 */
	static updateURL(
		view: ViewType,
		options?: {
			perspectiveId?: string;
			projectId?: string;
			workspaceId?: string;
			replaceState?: boolean;
			noScroll?: boolean;
		}
	): void {
		const params = new URLSearchParams();
		
		if (options?.workspaceId) {
			params.set('workspace', options.workspaceId);
		}
		
		params.set('view', view);
		
		if (options?.perspectiveId && view === 'perspective') {
			params.set('perspective', options.perspectiveId);
		}
		
		if (options?.projectId && view === 'project') {
			params.set('project', options.projectId);
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
		view: ViewType,
		options?: {
			perspectiveId?: string;
			projectId?: string;
			workspaceId?: string;
		}
	): void {
		const params = new URLSearchParams();
		
		if (options?.workspaceId) {
			params.set('workspace', options.workspaceId);
		}
		
		params.set('view', view);
		
		if (options?.perspectiveId && view === 'perspective') {
			params.set('perspective', options.perspectiveId);
		}
		
		if (options?.projectId && view === 'project') {
			params.set('project', options.projectId);
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
}