<!-- MIGRATION: This is a pure presentation component - can stay mostly as-is
     Move to lib/components/tasks/TaskItem.svelte -->
<script lang="ts">
	import type { Task } from '$lib/types';

	interface Props {
		task: Task;
		onToggle: (id: string) => void;
		onClick: (task: Task) => void;

		showProjectBadge?: boolean;
		showPerspectiveBadge?: boolean;
		perspectiveName?: string;
		projectName?: string;
	}

	let { task, onToggle, onClick, showProjectBadge = true, showPerspectiveBadge = false, perspectiveName, projectName }: Props = $props();
</script>

<div
	class="group flex items-start gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
	onclick={() => onClick(task)}
	onkeydown={(e) => e.key === 'Enter' && onClick(task)}
	role="button"
	tabindex="0"
>
	<!-- Completion checkbox -->
	<button
		onclick={(e) => { e.stopPropagation(); onToggle(task.id); }}
		class="flex-shrink-0 w-4 h-4 rounded-full border-2 {task.completed 
			? 'bg-blue-500 border-blue-500' 
			: 'border-gray-400 dark:border-gray-500 hover:border-gray-600 dark:hover:border-gray-300'}"
		style="margin-top: 2px;"
	>
		{#if task.completed}
			<span class="text-white text-xs leading-none flex items-center justify-center h-full">✓</span>
		{/if}
	</button>

	<!-- Task content -->
	<div class="flex-1 min-w-0">
		<div class="flex items-baseline gap-2">
			<span class="text-sm leading-5 text-gray-900 dark:text-gray-100 {task.completed ? 'line-through opacity-50' : ''}">
				{task.title}
			</span>
			<!-- removed decorative bullet next to title -->
		</div>
		
		{#if task.description}
			<p class="text-xs leading-5 text-gray-500 dark:text-gray-400 mt-0.5 {task.completed ? 'line-through opacity-50' : ''}">
				{task.description}
			</p>
		{/if}
	</div>

	<!-- Badges (right side) -->
	<div class="flex-shrink-0 mr-2 self-baseline flex gap-2">
		<!-- Perspective badge -->
		{#if showPerspectiveBadge && perspectiveName}
			<span class="text-xs leading-5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
				{perspectiveName}
			</span>
		{/if}
		
		<!-- Project badge -->
		{#if task.projectId && showProjectBadge}
			<span class="text-xs leading-5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
				{projectName || task.projectId}
			</span>
		{/if}
	</div>


</div>