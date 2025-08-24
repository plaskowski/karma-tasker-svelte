<script lang="ts">
	import type { Task } from '$lib/types';
	import { fly } from 'svelte/transition';

	interface Props {
		task: Task;
		onToggle: (id: string) => void;
		onClick: (task: Task) => void;

		showProjectBadge?: boolean;
	}

	let { task, onToggle, onClick, showProjectBadge = true }: Props = $props();
</script>

<div
	class="group flex items-center gap-3 px-3 py-2 hover:bg-surface-100 rounded cursor-pointer transition-colors"
	onclick={() => onClick(task)}
	onkeydown={(e) => e.key === 'Enter' && onClick(task)}
	role="button"
	tabindex="0"
	transition:fly={{ y: -10, duration: 200 }}
>
	<!-- Completion checkbox -->
	<button
		onclick={(e) => { e.stopPropagation(); onToggle(task.id); }}
		class="flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all {task.completed 
			? 'bg-primary-500 border-primary-500' 
			: 'border-surface-400 hover:border-surface-600'}"
	>
		{#if task.completed}
			<span class="text-white text-xs leading-none flex items-center justify-center h-full">✓</span>
		{/if}
	</button>

	<!-- Task content -->
	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-2">
			<span class="text-sm text-surface-900 {task.completed ? 'line-through opacity-50' : ''}">
				{task.title}
			</span>
			{#if task.description}
				<span class="text-xs text-surface-500">•</span>
			{/if}
		</div>
		
		{#if task.description}
			<p class="text-xs text-surface-500 mt-1 {task.completed ? 'line-through opacity-50' : ''}">
				{task.description}
			</p>
		{/if}
	</div>

	<!-- Project badge (right side) -->
	{#if task.projectId && showProjectBadge}
		<div class="flex-shrink-0 mr-2">
			<span class="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
				{task.projectId}
			</span>
		</div>
	{/if}


</div>