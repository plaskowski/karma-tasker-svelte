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
		closing?: boolean;
	}

	let { task, projects, perspectives, startHeight, closing = false }: Props = $props();

	const dispatch = createEventDispatcher<{ close: void; closed: void }>();

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

	function shrinkToHeight(node: HTMLElement, params: { end?: number; duration?: number } = {}) {
		const end = Math.max(0, params.end ?? 0);
		const duration = params.duration ?? 160;
		const full = node.scrollHeight;
		return {
			duration,
			easing: cubicOut,
			css: (t: number) => `height: ${full - (full - end) * t}px; overflow:hidden;`
		};
	}
</script>

<section
	class="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
	in:growFromHeight={{ start: startHeight ?? 0, duration: 180 }}
	out:shrinkToHeight={{ end: startHeight ?? 0, duration: 160 }}
	onoutroend={() => dispatch('closed')}
	aria-label="Task inline editor"
>
	<TaskEditorForm {task} {projects} {perspectives} on:close={() => dispatch('close')} />
</section>
