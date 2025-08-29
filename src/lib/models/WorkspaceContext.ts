import type { Project, PerspectiveConfig, Workspace, WorkspaceData } from '$lib/types';

/**
 * WorkspaceContext - A rich workspace object that encapsulates all workspace-related
 * data and operations. Exposes only methods, no raw data fields.
 */
export type WorkspaceContext = WorkspaceData;

/**
 * DEPRECATED: Class-based context. Migrate to `WorkspaceData` + helpers.
 */
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
  
  
  
}