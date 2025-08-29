import { derived, type Readable } from 'svelte/store';
import type { Project, PerspectiveConfig, Workspace, Task } from '$lib/types';
import { currentWorkspaceId } from './currentWorkspace';
import { 
  workspaces,
  workspaceProjects, 
  workspacePerspectivesOrdered 
} from './taskStore';

// Re-export workspace management functions
export { setCurrentWorkspace, getCurrentWorkspaceId } from './currentWorkspace';

/**
 * WorkspaceContext - A rich workspace object that encapsulates all workspace-related
 * data and operations. Exposes only methods, no raw data fields.
 */
export interface WorkspaceContext {
  // Identity
  getId(): string;
  getName(): string;
  
  // Projects
  getProjects(): readonly Project[];
  getProject(id: string): Project | undefined;
  getProjectByName(name: string): Project | undefined;
  getProjectsSortedByOrder(): readonly Project[];
  getDefaultProject(): Project | undefined;
  hasProject(id: string): boolean;
  getProjectCount(): number;
  
  // Perspectives  
  getPerspectives(): readonly PerspectiveConfig[];
  getPerspective(id: string): PerspectiveConfig | undefined;
  getPerspectiveByName(name: string): PerspectiveConfig | undefined;
  getDefaultPerspective(): PerspectiveConfig | undefined;
  hasPerspective(id: string): boolean;
  getPerspectiveCount(): number;
  getPerspectiveOrder(id: string): number;
  
  // Validation
  isValidProject(id: string | undefined): boolean;
  isValidPerspective(id: string | undefined): boolean;
  
  // Context-aware defaults (based on navigation state)
  getEffectiveProjectId(navigation: { currentView: string; currentProjectId?: string }): string | undefined;
  getEffectivePerspectiveId(navigation: { currentView: string; currentPerspectiveId?: string }): string;
  
  // Task operations
  sortTasksByPerspectiveThenOrder(tasks: Task[]): Task[];
  sortTasksByProjectThenOrder(tasks: Task[]): Task[];
  groupTasksByProject(tasks: Task[]): Map<string, Task[]>;
  groupTasksByPerspective(tasks: Task[]): Map<string, Task[]>;
}

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
    // First project by order, or first in array
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
    return this.perspectives[0]; // Already ordered
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
  getEffectiveProjectId(navigation: { currentView: string; currentProjectId?: string }): string | undefined {
    // If in project view and have a current project, use it
    if (navigation.currentView === 'project' && navigation.currentProjectId) {
      return navigation.currentProjectId;
    }
    // Otherwise use the default project
    return this.getDefaultProject()?.id;
  }
  
  getEffectivePerspectiveId(navigation: { currentView: string; currentPerspectiveId?: string }): string {
    // If in perspective view and have a current perspective, use it
    if (navigation.currentView === 'perspective' && navigation.currentPerspectiveId) {
      return navigation.currentPerspectiveId;
    }
    // Otherwise use the default perspective (inbox)
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

/**
 * Derived store that provides a rich WorkspaceContext object
 * with methods to access workspace data. No raw fields are exposed.
 */
export const workspaceContext: Readable<WorkspaceContext> = derived(
  [currentWorkspaceId, workspaces, workspaceProjects, workspacePerspectivesOrdered],
  ([$currentWorkspaceId, $workspaces, $projects, $perspectives]) => {
    const workspace = $workspaces.find(w => w.id === $currentWorkspaceId);
    
    if (!workspace) {
      // Return a null object pattern implementation
      return new WorkspaceContextImpl(
        { id: '', name: 'Unknown', perspectives: [], createdAt: new Date() },
        [],
        []
      );
    }
    
    return new WorkspaceContextImpl(
      workspace,
      $projects,
      $perspectives
    );
  }
);