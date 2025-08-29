<script lang="ts">
	import type { Task } from '$lib/types';
	import type { WorkspaceContext } from '$lib/models/WorkspaceContext';
	import TaskEditorForm from './TaskEditorForm.svelte';
	import { createEventDispatcher } from 'svelte';
	
	// Close on Escape via window listener to avoid a11y warnings on static elements
	$effect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				dispatch('close');
			}
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});

	interface Props {
		task: Task;
		workspace: WorkspaceContext;
		onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
	}

	let { task, workspace, onUpdateTask }: Props = $props();

	const dispatch = createEventDispatcher<{ close: void }>();
</script>

<section class="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4" aria-label="Task inline editor">
	<TaskEditorForm {task} {workspace} {onUpdateTask} on:close={() => dispatch('close')} />
</section>
