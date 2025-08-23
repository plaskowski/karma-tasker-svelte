<script lang="ts">
	import { addTask, projects } from '$lib/stores/taskStore';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		open: boolean;
	}

	let { open }: Props = $props();
	
	const dispatch = createEventDispatcher();

	// Form state
	let title = $state('');
	let description = $state('');
	let projectId = $state('');
	let tags = $state('');
	let starred = $state(false);
	let submitting = $state(false);

	async function handleSubmit() {
		if (!title.trim()) return;

		submitting = true;
		try {
			const tagArray = tags
				? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
				: [];

			await addTask({
				title: title.trim(),
				description: description.trim() || undefined,
				projectId: projectId || undefined,
				tags: tagArray,
				completed: false,
				starred,
			});

			// Reset form
			title = '';
			description = '';
			projectId = '';
			tags = '';
			starred = false;

			dispatch('close');
		} catch (error) {
			console.error('Failed to create task:', error);
		} finally {
			submitting = false;
		}
	}

	function handleCancel() {
		// Reset form
		title = '';
		description = '';
		projectId = '';
		tags = '';
		starred = false;
		dispatch('close');
	}
</script>

{#if open}
	<div class="modal-backdrop">
		<div class="modal bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-xl">
			<header class="modal-header mb-4">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">New Task</h2>
			</header>

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<!-- Title -->
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						<span>Title *</span>
					</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
					>
						<option value="">No project</option>
						{#each $projects as project}
							<option value={project.id}>{project.name}</option>
						{/each}
					</select>
				</div>

				<!-- Tags -->
				<div>
					<label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						<span>Tags</span>
					</label>
					<input
						id="tags"
						type="text"
						bind:value={tags}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
						placeholder="Comma-separated tags"
					/>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Separate multiple tags with commas
					</p>
				</div>

				<!-- Starred -->
				<div class="flex items-center space-x-2">
					<input
						id="starred"
						type="checkbox"
						bind:checked={starred}
						class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
					/>
					<label for="starred" class="text-sm font-medium text-gray-700 dark:text-gray-300">
						<span>Star this task</span>
					</label>
				</div>

				<!-- Actions -->
				<footer class="modal-footer flex justify-end gap-2 pt-4">
					<button
						type="button"
						onclick={handleCancel}
						class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
						disabled={submitting}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={submitting || !title.trim()}
					>
						{submitting ? 'Creating...' : 'Create Task'}
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