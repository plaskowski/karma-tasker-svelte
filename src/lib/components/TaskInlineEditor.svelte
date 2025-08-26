<script lang="ts">
	import type { Task, Project, PerspectiveConfig } from '$lib/types';
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
		projects: Project[];
		perspectives: PerspectiveConfig[];
	}

	let { task, projects, perspectives }: Props = $props();

	const dispatch = createEventDispatcher<{ close: void }>();
</script>

<section class="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4" aria-label="Task inline editor">
	<TaskEditorForm {task} {projects} {perspectives} on:close={() => dispatch('close')} />
</section>
