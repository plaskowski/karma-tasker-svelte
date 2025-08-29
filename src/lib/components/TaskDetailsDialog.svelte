<script lang="ts">
	import type { Task } from '$lib/types';
	import type { WorkspaceContext } from '$lib/models/WorkspaceContext';
	import { createEventDispatcher } from 'svelte';
	import TaskEditorForm from './TaskEditorForm.svelte';

	interface Props {
		open: boolean;
		task: Task | null;
		workspace: WorkspaceContext;
		onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
	}

	let { open, task, workspace, onUpdateTask }: Props = $props();

	const dispatch = createEventDispatcher();

	function handleClose() { dispatch('close'); }
</script>

{#if open && task}
	<div class="modal-backdrop">
		<div class="modal bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-xl">
			<header class="modal-header mb-4">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Task</h2>
			</header>

			{#if task}
				<TaskEditorForm {task} {workspace} {onUpdateTask} on:close={handleClose} />
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}

	.modal {
		max-height: 90vh;
		overflow-y: auto;
	}
</style>
