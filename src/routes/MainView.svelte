<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import TaskList from "$lib/components/TaskList.svelte";
  import TaskEditorForm from "$lib/components/TaskEditorForm.svelte";
  import { NavigationService } from "$lib/services/navigation";
  import { TaskService } from "$lib/services/tasks";
  import { keyboard } from "$lib/actions/keyboard";
  import type { Task } from "$lib/types";
  import type { PageData } from "./$types";

  interface MainViewProps {
    data: PageData;
    onTaskToggle: (id: string) => Promise<void>;
    onUpdateTask: (id: string, updates: any) => Promise<void>;
    onCreateTask: (taskData: {
      title: string;
      description?: string;
      projectId: string;
      perspective: string;
    }) => Promise<void>;
    onRefresh: () => Promise<void>;
    onClearCompleted: () => Promise<void>;
  }

  let {
    data,
    onTaskToggle,
    onUpdateTask,
    onCreateTask,
    onRefresh,
    onClearCompleted,
  }: MainViewProps = $props();

  let workspaceContext = $derived(data.workspaceContext);
  let currentTasks = $derived(data.tasks);
  let currentNavigation = $derived(data.navigation);

  let showCreateEditor = $state(false);
  let createEditorEl = $state<HTMLElement | null>(null);
  let mainAreaEl = $state<HTMLElement | null>(null);

  onMount(() => {
    NavigationService.updateURLIfChanged(
      $page.url.searchParams,
      currentNavigation,
      { workspaceId: workspaceContext.id },
    );

    // Auto-focus the main area on mount so keyboard shortcuts work immediately
    setTimeout(() => {
      if (mainAreaEl) {
        mainAreaEl.focus();
      }
    }, 100);
  });

  async function handleTaskToggle(id: string) {
    try {
      await onTaskToggle(id);
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  }

  function handleNewTask() {
    showCreateEditor = true;
  }

  function handleCreateClose() {
    showCreateEditor = false;
  }

  function handleEscape() {
    if (showCreateEditor) {
      showCreateEditor = false;
      // Return focus to main area so keyboard shortcuts work again
      if (mainAreaEl) {
        mainAreaEl.focus();
      }
    }
  }

  async function handleCleanup() {
    await onClearCompleted();
  }

  function createNewTaskWithDefaults(): Task {
    return TaskService.createNewTaskWithDefaults(
      workspaceContext,
      currentNavigation,
    );
  }

  async function handleRefresh() {
    await onRefresh();
  }

  $effect(() => {
    if (showCreateEditor && createEditorEl) {
      createEditorEl.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });

  $effect(() => {
    currentNavigation;
    showCreateEditor = false;
  });

  // Ensure focus is returned to main area after task creation
  $effect(() => {
    if (!showCreateEditor && mainAreaEl) {
      // Small delay to ensure any UI updates are complete
      setTimeout(() => {
        if (mainAreaEl) {
          mainAreaEl.focus();
        }
      }, 100);
    }
  });
</script>

<div
  bind:this={mainAreaEl}
  class="flex flex-1 flex-col overflow-hidden"
  use:keyboard={{
    n: handleNewTask,
    escape: handleEscape,
  }}
  tabindex="-1"
  style="outline: none;"
>
  <TaskList
    tasks={currentTasks}
    workspace={workspaceContext}
    navigation={currentNavigation}
    onTaskToggle={handleTaskToggle}
    {onUpdateTask}
    showCompleted={true}
    onNewTask={handleNewTask}
    onCleanup={handleCleanup}
    onRefresh={handleRefresh}
  />

  {#if showCreateEditor}
    <div
      class="border-t border-gray-200 px-6 py-4 dark:border-gray-700"
      bind:this={createEditorEl}
    >
      <div
        class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
        role="dialog"
        aria-label="Create new task"
        data-testid="task-editor-panel"
      >
        <TaskEditorForm
          task={createNewTaskWithDefaults()}
          workspace={workspaceContext}
          save={async ({ title, description, projectId, perspective }) => {
            if (!projectId || !perspective) {
              throw new Error(
                "Project and perspective are required for task creation",
              );
            }
            await onCreateTask({ title, description, projectId, perspective });
            handleCreateClose();
          }}
          on:close={handleCreateClose}
        />
      </div>
    </div>
  {/if}
</div>
