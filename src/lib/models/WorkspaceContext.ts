import type { Project, PerspectiveConfig, Workspace, Task } from '$lib/types';

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
  getProjectsSortedByOrder(): readonly Project[];
  getDefaultProject(): Project | undefined;
  hasProject(id: string): boolean;
  
  // Perspectives  
  getPerspectives(): readonly PerspectiveConfig[];
  getPerspective(id: string): PerspectiveConfig | undefined;
  getDefaultPerspective(): PerspectiveConfig | undefined;
  hasPerspective(id: string): boolean;
  getPerspectiveOrder(id: string): number;
  
  // Context-aware defaults (based on navigation state)
  getEffectiveProjectId(navigation: { currentView: string; currentProjectId?: string }): string;
  getEffectivePerspectiveId(navigation: { currentView: string; currentPerspectiveId?: string }): string;
  
}

export class WorkspaceContextImpl implements WorkspaceContext {
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
  
  
  // Perspectives
  getPerspectives(): readonly PerspectiveConfig[] {
    return this.perspectives;
  }
  
  getPerspective(id: string): PerspectiveConfig | undefined {
    return this.perspectives.find(p => p.id === id);
  }
  
  
  getDefaultPerspective(): PerspectiveConfig | undefined {
    return this.perspectives[0];
  }
  
  hasPerspective(id: string): boolean {
    return this.perspectives.some(p => p.id === id);
  }
  
  
  getPerspectiveOrder(id: string): number {
    const index = this.perspectives.findIndex(p => p.id === id);
    return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
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
  
}