import type { Project, Perspective, WorkspaceData } from '$lib/types';

/**
 * Pure helper functions for working with WorkspaceData.
 * These replace methods previously provided by WorkspaceContextImpl.
 */

// Identity
export function getWorkspaceId(workspace: WorkspaceData): string {
  return workspace.id;
}

export function getWorkspaceName(workspace: WorkspaceData): string {
  return workspace.name;
}

// Projects
export function getProjects(workspace: WorkspaceData): readonly Project[] {
  return workspace.projects;
}

export function findProject(workspace: WorkspaceData, projectId: string): Project | undefined {
  return workspace.projects.find(project => project.id === projectId);
}

export function getProjectsSortedByOrder(workspace: WorkspaceData): readonly Project[] {
  return [...workspace.projects].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getDefaultProject(workspace: WorkspaceData): Project | undefined {
  const sorted = getProjectsSortedByOrder(workspace);
  return sorted[0];
}

export function hasProject(workspace: WorkspaceData, projectId: string): boolean {
  return workspace.projects.some(project => project.id === projectId);
}

// Perspectives
export function getPerspectives(workspace: WorkspaceData): readonly Perspective[] {
  return workspace.perspectives;
}

export function findPerspective(workspace: WorkspaceData, perspectiveId: string): Perspective | undefined {
  return workspace.perspectives.find(perspective => perspective.id === perspectiveId);
}

export function getDefaultPerspective(workspace: WorkspaceData): Perspective | undefined {
  return workspace.perspectives[0];
}

export function hasPerspective(workspace: WorkspaceData, perspectiveId: string): boolean {
  return workspace.perspectives.some(perspective => perspective.id === perspectiveId);
}

export function getPerspectiveOrder(workspace: WorkspaceData, perspectiveId: string): number {
  const index = workspace.perspectives.findIndex(perspective => perspective.id === perspectiveId);
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}
