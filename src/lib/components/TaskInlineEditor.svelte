<script lang="ts">
	import type { Task, Project, PerspectiveConfig } from '$lib/types';
	import TaskEditorForm from './TaskEditorForm.svelte';
	import { createEventDispatcher } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	
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
		startHeight?: number;
	}

	let { task, projects, perspectives, startHeight }: Props = $props();

	const dispatch = createEventDispatcher<{ close: void }>();

	// Custom transition that grows from a specific start height
	function growFromHeight(node: HTMLElement, params: { start?: number; duration?: number } = {}) {
		const start = Math.max(0, params.start ?? 0);
		const duration = params.duration ?? 180;
		const full = node.scrollHeight;
		return {
			duration,
			easing: cubicOut,
			css: (t: number) => `height: ${start + (full - start) * t}px; overflow:hidden;`
		};
	}
</script>

<section class="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4" transition:growFromHeight={{ start: startHeight ?? 0, duration: 180 }} aria-label="Task inline editor">
	<TaskEditorForm {task} {projects} {perspectives} on:close={() => dispatch('close')} />
</section>
