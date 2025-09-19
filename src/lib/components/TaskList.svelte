<script lang="ts">
  import type { Task, WorkspaceData, NavigationState } from "$lib/types";
  import { findPerspective, findProject } from "$lib/helpers/workspaceHelpers";
  import TaskListHeader from "./TaskListHeader.svelte";
  import TaskListEmpty from "./TaskListEmpty.svelte";
  import TaskGroupComponent from "./TaskGroup.svelte";
  import {
    getTaskGroups,
    shouldShowProjectBadge,
    shouldShowPerspectiveBadge,
  } from "./taskGrouping";

  interface Props {
    tasks: Task[];
    workspace: WorkspaceData;
    navigation: NavigationState;
    onTaskToggle: (id: string) => void | Promise<void>;
    onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    showCompleted?: boolean;
    onNewTask?: () => void;
    onCleanup?: () => void;
    onRefresh?: () => void;
  }

  let {
    tasks,
    workspace,
    navigation,
    onTaskToggle,
    onUpdateTask,
    showCompleted = false,
    onNewTask,
    onCleanup,
    onRefresh,
  }: Props = $props();

  // Local state for inline editing
  let inlineEditingTaskId: string | null = $state(null);

  // Derived values using props directly
  const activeTasks = $derived(tasks.filter((t) => !t.completed));
  const completedTasks = $derived(tasks.filter((t) => t.completed));

  // Use the extracted grouping functions
  const taskGroups = $derived(
    getTaskGroups(activeTasks, navigation, workspace),
  );
  const showProjectBadge = $derived(shouldShowProjectBadge(navigation));
  const showPerspectiveBadge = $derived(shouldShowPerspectiveBadge(navigation));

  // Helper methods
  function getTaskProjectName(task: Task): string {
    const project = findProject(workspace, task.projectId);
    if (!project) {
      throw new Error(
        `Project with ID ${task.projectId} not found in workspace`,
      );
    }
    return project.name;
  }

  function getTaskPerspectiveName(task: Task): string {
    const perspective = findPerspective(workspace, task.perspectiveId);
    if (!perspective) {
      throw new Error(
        `Perspective with ID ${task.perspectiveId} not found in workspace`,
      );
    }
    return perspective.name;
  }

  function toggleInlineEditor(taskId: string) {
    inlineEditingTaskId = inlineEditingTaskId === taskId ? null : taskId;
  }

  function closeInlineEditor() {
    inlineEditingTaskId = null;
  }

  function isEditingTask(taskId: string): boolean {
    return inlineEditingTaskId === taskId;
  }

  // Close inline editor when view changes
  $effect(() => {
    navigation;
    closeInlineEditor();
  });
</script>

<div class="flex h-full flex-1 flex-col">
  <!-- Header -->
  <TaskListHeader
    {navigation}
    {workspace}
    {onNewTask}
    {onCleanup}
    {onRefresh}
  />

  <!-- Task List Content -->
  <div class="flex-1 overflow-auto">
    {#if tasks.length === 0}
      <TaskListEmpty />
    {:else}
      <div class="space-y-1 p-6">
        <!-- Active task groups -->
        {#each taskGroups as group}
          <TaskGroupComponent
            title={group.title}
            tasks={group.tasks}
            {workspace}
            {navigation}
            isGroupTitle={true}
            {showProjectBadge}
            {showPerspectiveBadge}
            {getTaskProjectName}
            {getTaskPerspectiveName}
            {isEditingTask}
            {toggleInlineEditor}
            {closeInlineEditor}
            {onTaskToggle}
            {onUpdateTask}
          />
        {/each}

        <!-- Completed Tasks -->
        {#if (showCompleted || completedTasks.length > 0) && completedTasks.length > 0}
          <TaskGroupComponent
            title="Done"
            tasks={completedTasks}
            {workspace}
            {navigation}
            isGroupTitle={false}
            isCompleted={true}
            {showProjectBadge}
            {showPerspectiveBadge}
            {getTaskProjectName}
            {getTaskPerspectiveName}
            {isEditingTask}
            {toggleInlineEditor}
            {closeInlineEditor}
            {onTaskToggle}
            {onUpdateTask}
          />
        {/if}
      </div>
    {/if}
  </div>
</div>
