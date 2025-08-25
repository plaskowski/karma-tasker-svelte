<script lang="ts">
	import type { Task, Project, PerspectiveConfig } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { updateTask } from '$lib/stores/taskStore';

	interface Props {
		task: Task;
		projects: Project[];
		perspectives: PerspectiveConfig[];
	}

	let { task, projects, perspectives }: Props = $props();

	const dispatch = createEventDispatcher();

	let title = $state(task.title);
	let description = $state(task.description ?? '');
	let projectId = $state(task.projectId);
	let perspective = $state(task.perspective ?? '');
	let submitting = $state(false);

	const titleId = `title-${task.id}`;
	const descId = `desc-${task.id}`;
	const projectIdId = `project-${task.id}`;
	const perspectiveId = `perspective-${task.id}`;

	async function handleSave() {
		if (!title.trim()) return;
		submitting = true;
		try {
			await updateTask(task.id, {
				title: title.trim(),
				description: description.trim() || undefined,
				projectId,
				perspective: perspective || undefined
			});
			dispatch('close');
		} catch (err) {
			console.error(err);
		} finally {
			submitting = false;
		}
	}

	function handleCancel() {
		dispatch('close');
	}
</script>

<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-3">
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<!-- Left column: main fields -->
		<div class="md:col-span-3 space-y-3">
			<div>
				<label for={titleId} class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title *</label>
				<input
					id={titleId}
					type="text"
					bind:value={title}
					class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Task title"
					required
				/>
			</div>
			<div>
				<label for={descId} class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
				<textarea
					id={descId}
					bind:value={description}
					rows="3"
					class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Optional details"
				></textarea>
			</div>
		</div>

		<!-- Right column: meta fields -->
		<div class="md:col-span-1 space-y-3">
			<div>
				<label for={projectIdId} class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project</label>
				<select
					id={projectIdId}
					bind:value={projectId}
					class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{#each projects as p}
						<option value={p.id}>{p.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for={perspectiveId} class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Perspective</label>
				<select
					id={perspectiveId}
					bind:value={perspective}
					class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="">Inbox (Unprocessed)</option>
					{#each perspectives as p}
						{#if p.id !== 'inbox'}
							<option value={p.id}>{p.name}</option>
						{/if}
					{/each}
				</select>
			</div>
		</div>
	</div>

	<div class="flex items-center justify-end gap-2 pt-2">
		<button type="button" class="btn btn-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300" onclick={handleCancel} disabled={submitting}>Cancel</button>
		<button type="submit" class="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50" disabled={submitting || !title.trim()}>Save</button>
	</div>
</form>
