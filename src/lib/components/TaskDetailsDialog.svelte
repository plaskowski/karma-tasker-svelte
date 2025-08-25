<script lang="ts">
	import type { Task } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { workspaceProjects, workspacePerspectives, currentWorkspace } from '$lib/stores/taskStore';
	import { updateTask } from '$lib/stores/taskStore';

	interface Props {
		open: boolean;
		task: Task | null;
	}

	let { open, task }: Props = $props();

	const dispatch = createEventDispatcher();

	// Local form state derived from task
	let title = $state('');
	let description = $state('');
	let projectId = $state('');
	let perspective = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (task) {
			title = task.title;
			description = task.description ?? '';
			projectId = task.projectId;
			perspective = task.perspective ?? '';
		}
	});

	async function handleSave() {
		if (!task) return;
		if (!title.trim()) return;

		submitting = true;
		try {
			await updateTask(task.id, {
				title: title.trim(),
				description: description.trim() || undefined,
				projectId: projectId || task.projectId,
				perspective: perspective || undefined
			});
			dispatch('close');
		} catch (error) {
			console.error('Failed to save task:', error);
		} finally {
			submitting = false;
		}
	}

	function handleCancel() {
		dispatch('close');
	}
</script>

{#if open && task}
	<div class="modal-backdrop">
		<div class="modal bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-xl">
			<header class="modal-header mb-4">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Task</h2>
			</header>

			<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-4">
				<!-- Title -->
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						<span>Title *</span>
					</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						placeholder="Enter task title"
						required
					/>
				</div>

				<!-- Description -->
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						<span>Description</span>
					</label>
					<textarea
						id="description"
						bind:value={description}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						placeholder="Optional description"
						rows="3"
					></textarea>
				</div>

				<!-- Project -->
				<div>
					<label for="project" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						<span>Project</span>
					</label>
					<select
						id="project"
						bind:value={projectId}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					>
						{#each $workspaceProjects as project}
							<option value={project.id}>{project.name}</option>
						{/each}
					</select>
				</div>

				<!-- Perspective -->
				<div>
					<label for="perspective" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						<span>Perspective</span>
					</label>
					<select
						id="perspective"
						bind:value={perspective}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					>
						<option value="">Inbox (Unprocessed)</option>
						{#each $workspacePerspectives as p}
							{#if p.id !== 'inbox'}
								<option value={p.id}>{p.name}</option>
							{/if}
						{/each}
					</select>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Choose how to categorize this task in your workflow
					</p>
				</div>

				<!-- Actions -->
				<footer class="modal-footer flex justify-end gap-2 pt-4">
					<button
						type="button"
						onclick={handleCancel}
						class="btn btn-base bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
						disabled={submitting}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-base bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={submitting || !title.trim()}
					>
						{submitting ? 'Saving...' : 'Save Changes'}
					</button>
				</footer>
			</form>
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
