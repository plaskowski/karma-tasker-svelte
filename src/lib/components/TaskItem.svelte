<script lang="ts">
	import type { Task } from '$lib/types';

	interface Props {
		task: Task;
		onToggle: (id: string) => void;
		onClick: (task: Task) => void;

		showProjectBadge?: boolean;
	}

	let { task, onToggle, onClick, showProjectBadge = true }: Props = $props();
</script>

<div
	class="group flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
	onclick={() => onClick(task)}
	onkeydown={(e) => e.key === 'Enter' && onClick(task)}
	role="button"
	tabindex="0"
>
	<!-- Completion checkbox -->
	<button
		onclick={(e) => { e.stopPropagation(); onToggle(task.id); }}
		class="flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all {task.completed 
			? 'bg-blue-500 border-blue-500' 
			: 'border-gray-400 dark:border-gray-500 hover:border-gray-600 dark:hover:border-gray-300'}"
	>
		{#if task.completed}
			<span class="text-white text-xs leading-none flex items-center justify-center h-full">✓</span>
		{/if}
	</button>

	<!-- Task content -->
	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-2">
			<span class="text-sm text-gray-900 dark:text-gray-100 {task.completed ? 'line-through opacity-50' : ''}">
				{task.title}
			</span>
			{#if task.description}
				<span class="text-xs text-gray-500 dark:text-gray-400">•</span>
			{/if}
		</div>
		
		{#if task.description}
			<p class="text-xs text-gray-500 dark:text-gray-400 mt-1 {task.completed ? 'line-through opacity-50' : ''}">
				{task.description}
			</p>
		{/if}
	</div>

	<!-- Project badge (right side) -->
	{#if task.projectId && showProjectBadge}
		<div class="flex-shrink-0 mr-2">
			<span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
				{task.projectId}
			</span>
		</div>
	{/if}


</div>