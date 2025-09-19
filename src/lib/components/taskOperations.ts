import type { Task, Project, Perspective } from "$lib/types";

/**
 * Task operations utilities for sorting and grouping tasks.
 * Extracted from WorkspaceContext to be co-located with taskListViewModel usage.
 */

export function sortTasksByPerspectiveThenOrder(
  tasks: Task[],
  perspectives: readonly Perspective[],
): Task[] {
  return [...tasks].sort((a, b) => {
    const perspA = getPerspectiveOrder(a.perspectiveId, perspectives);
    const perspB = getPerspectiveOrder(b.perspectiveId, perspectives);
    if (perspA !== perspB) return perspA - perspB;
    return a.order - b.order;
  });
}

export function sortTasksByProjectThenOrder(
  tasks: Task[],
  projects: readonly Project[],
): Task[] {
  return [...tasks].sort((a, b) => {
    const projectA = getProject(a.projectId, projects);
    const projectB = getProject(b.projectId, projects);
    const orderA = projectA?.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = projectB?.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.order - b.order;
  });
}

export function groupTasksByProject(tasks: Task[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();

  tasks.forEach((task) => {
    const existing = groups.get(task.projectId) || [];
    existing.push(task);
    groups.set(task.projectId, existing);
  });

  return groups;
}

export function groupTasksByPerspective(
  tasks: Task[],
  perspectives: readonly Perspective[],
): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();

  // Initialize with all perspectives
  perspectives.forEach((p) => {
    groups.set(p.id, []);
  });

  tasks.forEach((task) => {
    const existing = groups.get(task.perspectiveId) || [];
    existing.push(task);
    groups.set(task.perspectiveId, existing);
  });

  return groups;
}

// Helper functions
function getPerspectiveOrder(
  id: string,
  perspectives: readonly Perspective[],
): number {
  const index = perspectives.findIndex((p) => p.id === id);
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function getProject(
  id: string,
  projects: readonly Project[],
): Project | undefined {
  return projects.find((p) => p.id === id);
}

function getDefaultPerspective(
  perspectives: readonly Perspective[],
): Perspective | undefined {
  return perspectives[0];
}
