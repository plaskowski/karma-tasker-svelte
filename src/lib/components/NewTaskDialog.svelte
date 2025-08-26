<script lang="ts">
    import { addTask, workspaceProjects, workspacePerspectives, currentWorkspace } from '$lib/stores/taskStore';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		open: boolean;
		defaultProjectId?: string;
		defaultPerspectiveId?: string;
	}

	let { open, defaultProjectId, defaultPerspectiveId }: Props = $props();
	
	const dispatch = createEventDispatcher();

	// Form state
	let title = $state('');
	let description = $state('');
    let projectId = $state('');
	let perspective = $state('');
	let submitting = $state(false);

    // Preselect defaults when dialog opens
    $effect(() => {
        if (open) {
            // Use provided default or first project
            if (!projectId) {
                projectId = defaultProjectId || $workspaceProjects[0]?.id || '';
            }
            // Use provided default perspective
            if (!perspective && defaultPerspectiveId) {
                perspective = defaultPerspectiveId;
            }
        }
    });

	async function handleSubmit() {
		if (!title.trim()) return;

		submitting = true;
		try {
        // Pick first project of the current workspace if none selected
        const firstProjectId = $workspaceProjects[0]?.id || '';
        const finalProjectId = projectId || firstProjectId;

			await addTask({
				title: title.trim(),
				description: description.trim() || undefined,
				projectId: finalProjectId,
				workspaceId: $currentWorkspace,
				completed: false,
				perspective: perspective || undefined, // undefined = inbox
			});

			// Reset form
			title = '';
			description = '';
			projectId = '';
			perspective = '';

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
		perspective = '';
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
						<option value="">Default Project</option>
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