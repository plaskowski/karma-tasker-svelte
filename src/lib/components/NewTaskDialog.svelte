<script lang="ts">
	import { addTask, workspaceProjects, workspacePerspectives, currentWorkspace, workspaces } from '$lib/stores/taskStore';
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
	let perspective = $state('');
	let submitting = $state(false);

	async function handleSubmit() {
		if (!title.trim()) return;

		submitting = true;
		try {
			// Get default project if no project selected
			const currentWorkspaceData = $workspaces.find(w => w.id === $currentWorkspace);
			const finalProjectId = projectId || currentWorkspaceData?.defaultProjectId || 'personal-default';

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
		<div class="modal bg-surface-50 w-full max-w-md p-6 rounded-xl shadow-xl">
			<header class="modal-header mb-4">
				<h2 class="text-xl font-semibold text-surface-900">New Task</h2>
			</header>

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<!-- Title -->
				<div>
					<label for="title" class="block text-sm font-medium text-surface-700 mb-1">
						<span>Title *</span>
					</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						class="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-100 text-surface-900"
						placeholder="Enter task title"
						required
					/>
				</div>

				<!-- Description -->
				<div>
					<label for="description" class="block text-sm font-medium text-surface-700 mb-1">
						<span>Description</span>
					</label>
					<textarea
						id="description"
						bind:value={description}
						class="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-100 text-surface-900"
						placeholder="Optional description"
						rows="3"
					></textarea>
				</div>

				<!-- Project -->
				<div>
					<label for="project" class="block text-sm font-medium text-surface-700 mb-1">
						<span>Project</span>
					</label>
					<select
						id="project"
						bind:value={projectId}
						class="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-100 text-surface-900"
					>
						<option value="">Default Project</option>
						{#each $workspaceProjects as project}
							<option value={project.id}>{project.name}</option>
						{/each}
					</select>
				</div>

				<!-- Perspective -->
				<div>
					<label for="perspective" class="block text-sm font-medium text-surface-700 mb-1">
						<span>Perspective</span>
					</label>
					<select
						id="perspective"
						bind:value={perspective}
						class="w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-100 text-surface-900"
					>
						<option value="">Inbox (Unprocessed)</option>
						{#each $workspacePerspectives as p}
							{#if p.id !== 'inbox'}
								<option value={p.id}>{p.name}</option>
							{/if}
						{/each}
					</select>
					<p class="text-sm text-surface-500 mt-1">
						Choose how to categorize this task in your workflow
					</p>
				</div>

				<!-- Actions -->
				<footer class="modal-footer flex justify-end gap-2 pt-4">
					<button
						type="button"
						onclick={handleCancel}
						class="btn btn-base bg-surface-200 text-surface-700 hover:bg-surface-300"
						disabled={submitting}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-base bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
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