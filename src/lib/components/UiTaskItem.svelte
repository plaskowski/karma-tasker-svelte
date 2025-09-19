<script lang="ts">
  import type { Task } from "$lib/types";

  interface Props {
    task: Task;
    onToggle: (id: string) => void;
    badgeText?: string;
  }

  let { task, onToggle, badgeText }: Props = $props();
</script>

<div
  class="group flex items-start gap-3 rounded px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
>
  <!-- Completion checkbox -->
  <button
    onclick={(e) => {
      e.stopPropagation();
      onToggle(task.id);
    }}
    class="h-4 w-4 flex-shrink-0 rounded-full border-2 {task.completed
      ? 'border-blue-500 bg-blue-500'
      : 'border-gray-400 hover:border-gray-600 dark:border-gray-500 dark:hover:border-gray-300'}"
    style="margin-top: 2px;"
  >
    {#if task.completed}
      <span
        class="flex h-full items-center justify-center text-xs leading-none text-white"
        >✓</span
      >
    {/if}
  </button>

  <!-- Task content -->
  <div class="min-w-0 flex-1">
    <div class="flex items-baseline gap-2">
      <span
        class="text-sm leading-5 text-gray-900 dark:text-gray-100 {task.completed
          ? 'line-through opacity-50'
          : ''}"
      >
        {task.title}
      </span>
      <!-- removed decorative bullet next to title -->
    </div>

    {#if task.description}
      <p
        class="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400 {task.completed
          ? 'line-through opacity-50'
          : ''}"
      >
        {task.description}
      </p>
    {/if}
  </div>

  <!-- Badge (right side) -->
  {#if badgeText}
    <div class="mr-2 flex-shrink-0 self-baseline">
      <span
        class="rounded bg-blue-50 px-2 py-0.5 text-xs leading-5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        data-testid="badge"
        role="status"
        aria-label="Badge: {badgeText}"
      >
        {badgeText}
      </span>
    </div>
  {/if}
</div>
