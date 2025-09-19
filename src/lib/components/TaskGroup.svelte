<script lang="ts">
  import type { Task, WorkspaceData, NavigationState } from "$lib/types";
  import UiTaskItem from "./UiTaskItem.svelte";
  import TaskInlineEditor from "./TaskInlineEditor.svelte";
  import { getBadgeText } from "./taskGrouping";

  interface Props {
    title: string;
    tasks: Task[];
    workspace: WorkspaceData;
    navigation: NavigationState;
    isGroupTitle?: boolean;
    isCompleted?: boolean;
    showProjectBadge: boolean;
    showPerspectiveBadge: boolean;
    getTaskProjectName: (task: Task) => string;
    getTaskPerspectiveName: (task: Task) => string;
    isEditingTask: (taskId: string) => boolean;
    toggleInlineEditor: (taskId: string) => void;
    closeInlineEditor: () => void;
    onTaskToggle: (id: string) => void | Promise<void>;
    onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  }

  let {
    title,
    tasks,
    workspace,
    navigation,
    isGroupTitle = false,
    isCompleted = false,
    showProjectBadge,
    showPerspectiveBadge,
    getTaskProjectName,
    getTaskPerspectiveName,
    isEditingTask,
    toggleInlineEditor,
    closeInlineEditor,
    onTaskToggle,
    onUpdateTask,
  }: Props = $props();
</script>

<div class="mb-6 {isCompleted ? 'opacity-75' : ''}">
  <div class="mb-3">
    <h3
      class="text-base font-medium {isCompleted
        ? 'text-gray-400 dark:text-gray-500'
        : 'text-gray-500 dark:text-gray-400'} {isGroupTitle &&
      title.startsWith('project-')
        ? 'capitalize'
        : ''}"
    >
      <span>{title}</span>
    </h3>
  </div>
  {#each tasks as task (task.id)}
    {#if isEditingTask(task.id)}
      <TaskInlineEditor
        {task}
        {workspace}
        {onUpdateTask}
        on:close={closeInlineEditor}
      />
    {:else}
      <div
        onclick={() => toggleInlineEditor(task.id)}
        onkeydown={(e) => e.key === "Enter" && toggleInlineEditor(task.id)}
        role="button"
        tabindex="0"
        class="cursor-pointer"
      >
        <UiTaskItem
          {task}
          onToggle={onTaskToggle}
          badgeText={getBadgeText(task, navigation, workspace)}
        />
      </div>
    {/if}
  {/each}
</div>
