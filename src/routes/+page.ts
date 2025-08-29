import type { PageLoad } from './$types';
import { NavigationService } from '$lib/services/navigation';
import { get } from 'svelte/store';
import { 
	workspaces, 
	tasks, 
	projects
} from '$lib/stores/taskStore';
// Navigation is now managed through URL and load function
import { currentWorkspaceId, getCurrentWorkspaceId, setCurrentWorkspace } from '$lib/stores/currentWorkspace';
import type { WorkspaceContext } from '$lib/stores/workspaceContext';
import type { Task, Project, PerspectiveConfig, Workspace } from '$lib/types';

// Create WorkspaceContext implementation
class WorkspaceContextImpl implements WorkspaceContext {
	constructor(
		private readonly workspace: Workspace,
		private readonly projects: readonly Project[],
		private readonly perspectives: readonly PerspectiveConfig[]
	) {}
	
	// Identity
	getId(): string {
		return this.workspace.id;
	}
	
	getName(): string {
		return this.workspace.name;
	}
	
	// Projects
	getProjects(): readonly Project[] {
		return this.projects;
	}
	
	getProject(id: string): Project | undefined {
		return this.projects.find(p => p.id === id);
	}
	
	getProjectByName(name: string): Project | undefined {
		return this.projects.find(p => p.name === name);
	}
	
	getProjectsSortedByOrder(): readonly Project[] {
		return [...this.projects].sort((a, b) => a.order - b.order);
	}
	
	getDefaultProject(): Project | undefined {
		const sorted = this.getProjectsSortedByOrder();
		return sorted[0];
	}
	
	hasProject(id: string): boolean {
		return this.projects.some(p => p.id === id);
	}
	
	getProjectCount(): number {
		return this.projects.length;
	}
	
	// Perspectives
	getPerspectives(): readonly PerspectiveConfig[] {
		return this.perspectives;
	}
	
	getPerspective(id: string): PerspectiveConfig | undefined {
		return this.perspectives.find(p => p.id === id);
	}
	
	getPerspectiveByName(name: string): PerspectiveConfig | undefined {
		return this.perspectives.find(p => p.name === name);
	}
	
	getDefaultPerspective(): PerspectiveConfig | undefined {
		return this.perspectives[0];
	}
	
	hasPerspective(id: string): boolean {
		return this.perspectives.some(p => p.id === id);
	}
	
	getPerspectiveCount(): number {
		return this.perspectives.length;
	}
	
	getPerspectiveOrder(id: string): number {
		const index = this.perspectives.findIndex(p => p.id === id);
		return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
	}
	
	// Validation
	isValidProject(id: string | undefined): boolean {
		return id ? this.hasProject(id) : false;
	}
	
	isValidPerspective(id: string | undefined): boolean {
		return id ? this.hasPerspective(id) : false;
	}
	
	// Context-aware defaults
	getEffectiveProjectId(navigation: { currentView: string; currentProjectId?: string }): string {
		if (navigation.currentView === 'project' && navigation.currentProjectId) {
			return navigation.currentProjectId;
		}
		const defaultProject = this.getDefaultProject();
		if (!defaultProject) {
			throw new Error(`No default project found for workspace ${this.workspace.id}`);
		}
		return defaultProject.id;
	}
	
	getEffectivePerspectiveId(navigation: { currentView: string; currentPerspectiveId?: string }): string {
		if (navigation.currentView === 'perspective' && navigation.currentPerspectiveId) {
			return navigation.currentPerspectiveId;
		}
		return this.getDefaultPerspective()?.id || 'inbox';
	}
	
	// Task operations
	sortTasksByPerspectiveThenOrder(tasks: Task[]): Task[] {
		return [...tasks].sort((a, b) => {
			const perspA = a.perspective ? this.getPerspectiveOrder(a.perspective) : Number.MAX_SAFE_INTEGER;
			const perspB = b.perspective ? this.getPerspectiveOrder(b.perspective) : Number.MAX_SAFE_INTEGER;
			if (perspA !== perspB) return perspA - perspB;
			return a.order - b.order;
		});
	}
	
	sortTasksByProjectThenOrder(tasks: Task[]): Task[] {
		return [...tasks].sort((a, b) => {
			const projectA = a.projectId ? this.getProject(a.projectId) : undefined;
			const projectB = b.projectId ? this.getProject(b.projectId) : undefined;
			const orderA = projectA?.order ?? Number.MAX_SAFE_INTEGER;
			const orderB = projectB?.order ?? Number.MAX_SAFE_INTEGER;
			if (orderA !== orderB) return orderA - orderB;
			return a.order - b.order;
		});
	}
	
	groupTasksByProject(tasks: Task[]): Map<string, Task[]> {
		const groups = new Map<string, Task[]>();
		
		tasks.forEach(task => {
			if (task.projectId) {
				const existing = groups.get(task.projectId) || [];
				existing.push(task);
				groups.set(task.projectId, existing);
			}
		});
		
		return groups;
	}
	
	groupTasksByPerspective(tasks: Task[]): Map<string, Task[]> {
		const groups = new Map<string, Task[]>();
		
		// Initialize with all perspectives
		this.perspectives.forEach(p => {
			groups.set(p.id, []);
		});
		
		tasks.forEach(task => {
			const perspectiveId = task.perspective || this.getDefaultPerspective()?.id;
			if (perspectiveId) {
				const existing = groups.get(perspectiveId) || [];
				existing.push(task);
				groups.set(perspectiveId, existing);
			}
		});
		
		return groups;
	}
}

export const load: PageLoad = async ({ url }) => {
	// Parse URL parameters
	const urlParams = NavigationService.parseURLParams(url.searchParams);
	
	// Load all data from stores
	const allWorkspaces = get(workspaces);
	const allTasks = get(tasks);
	const allProjects = get(projects);
	
	// Determine current workspace
	let workspaceId = getCurrentWorkspaceId();
	if (urlParams.workspace && allWorkspaces.some(w => w.id === urlParams.workspace)) {
		workspaceId = urlParams.workspace;
		setCurrentWorkspace(workspaceId);
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