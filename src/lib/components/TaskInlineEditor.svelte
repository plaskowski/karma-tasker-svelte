<script lang="ts">
	import type { Task, Project, PerspectiveConfig } from '$lib/types';
	import TaskEditorForm from './TaskEditorForm.svelte';
	import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';

	interface Props {
		task: Task;
		projects: Project[];
		perspectives: PerspectiveConfig[];
	}

	let { task, projects, perspectives }: Props = $props();

	const dispatch = createEventDispatcher<{ close: void }>();
</script>

<div class="mt-2 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4" transition:slide={{ duration: 150 }}>
	<TaskEditorForm {task} {projects} {perspectives} on:close={() => dispatch('close')} />
</div>
