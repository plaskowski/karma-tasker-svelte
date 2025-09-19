import type { Perspective, Project, WorkspaceData } from "$lib/types";

// Projects
export function getProjects(workspace: WorkspaceData): readonly Project[] {
  return workspace.projects;
}

export function findProject(
  workspace: WorkspaceData,
  projectId: string,
): Project | undefined {
  return workspace.projects.find((project) => project.id === projectId);
}

export function getProjectsSortedByOrder(
  workspace: WorkspaceData,
): readonly Project[] {
  return [...workspace.projects].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );
}

export function getRequiredDefaultProject(workspace: WorkspaceData): Project {
  const sorted = getProjectsSortedByOrder(workspace);
  if (!sorted) {
    throw new Error(`No default project found for workspace ${workspace.id}`);
  }
  return sorted[0];
}

export function hasProject(
  workspace: WorkspaceData,
  projectId: string,
): boolean {
  return workspace.projects.some((project) => project.id === projectId);
}

// Perspectives
export function getPerspectives(
  workspace: WorkspaceData,
): readonly Perspective[] {
  return workspace.perspectives;
}

export function findPerspective(
  workspace: WorkspaceData,
  perspectiveId: string,
): Perspective | undefined {
  return workspace.perspectives.find(
    (perspective) => perspective.id === perspectiveId,
  );
}

export function getRequiredDefaultPerspective(
  workspace: WorkspaceData,
): Perspective {
  if (!workspace.perspectives) {
    throw new Error(
      `No default perspective found for workspace ${workspace.id}`,
    );
  }
  return workspace.perspectives[0];
}

export function hasPerspective(
  workspace: WorkspaceData,
  perspectiveId: string,
): boolean {
  return workspace.perspectives.some(
    (perspective) => perspective.id === perspectiveId,
  );
}

export function getPerspectiveOrder(
  workspace: WorkspaceData,
  perspectiveId: string,
): number {
  const index = workspace.perspectives.findIndex(
    (perspective) => perspective.id === perspectiveId,
  );
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

export function getRequiredTaskDefaults(workspace: WorkspaceData): {
  perspectiveId: string;
  projectId: string;
} {
  return {
    perspectiveId: getRequiredDefaultPerspective(workspace)?.id,
    projectId: getRequiredDefaultProject(workspace)?.id,
  };
}
