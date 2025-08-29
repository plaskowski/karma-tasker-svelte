<script lang="ts">
	import type { Task } from '$lib/types';
	import type { WorkspaceContext } from '$lib/models/WorkspaceContext';
	import { createEventDispatcher } from 'svelte';
    import { ChevronDown } from 'lucide-svelte';
    import { onMount } from 'svelte';

    type SaveFields = {
        title: string;
        description?: string;
        projectId?: string;
        perspective?: string;
    };

    interface Props {
        task: Task;
        workspace: WorkspaceContext;
        // Optional custom save handler; when provided, creation/update is delegated to parent
        save?: (fields: SaveFields) => Promise<void>;
        // Optional update handler for when save is not provided
        onUpdateTask?: (id: string, updates: Partial<Task>) => Promise<void>;
    }

    let { task, workspace, save, onUpdateTask }: Props = $props();

    const dispatch = createEventDispatcher();

	let title = $state(task.title);
	let description = $state(task.description ?? '');
	// projectId and perspective should always be set from task
	let projectId = $state<string>(task.projectId!);
    let perspective = $state(task.perspective!);
	let submitting = $state(false);

    const titleId = `title-${task.id}`;
	const descId = `desc-${task.id}`;
	const projectIdId = `project-${task.id}`;
	const perspectiveId = `perspective-${task.id}`;

    // Autofocus the title input when the editor mounts (create or edit)
    let titleInput = $state<HTMLInputElement | null>(null);
    onMount(() => {
        titleInput?.focus();
    });

    async function handleSave() {
		if (!title.trim()) return;
		submitting = true;
		try {
            const fields: SaveFields = {
                title: title.trim(),
                description: description.trim() || undefined,
                projectId,
                perspective
            };

            if (save) {
                await save(fields);
            } else if (onUpdateTask) {
                await onUpdateTask(task.id, fields);
            } else {
                throw new Error('No save or update handler provided');
            }
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

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            e.preventDefault();
            dispatch('close');
            return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!submitting) handleSave();
        }
    }
</script>

<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-3">
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<!-- Left column: main fields -->
		<div class="md:col-span-3 space-y-3">
			<div>
                <input
					id={titleId}
					type="text"
					bind:value={title}
                    bind:this={titleInput}
					onkeydown={onKeyDown}
					class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Title *"
					required
				/>
			</div>
			<div>
				<textarea
					id={descId}
					bind:value={description}
					rows="3"
					onkeydown={onKeyDown}
					class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Description (optional)"
				></textarea>
			</div>
		</div>

		<!-- Right column: meta fields + actions -->
		<div class="md:col-span-1 flex flex-col">
			<div class="mb-3 relative">
				<select
					id={projectIdId}
					bind:value={projectId}
					class="w-full appearance-none px-3 pr-12 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					{#if !projectId}
						<option value="" disabled selected>Project</option>
					{/if}
					{#each workspace.getProjects() as p}
						<option value={p.id}>{p.name}</option>
					{/each}
				</select>
				<ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400" />
			</div>
            <div class="mb-3 relative">
				<select
					id={perspectiveId}
					bind:value={perspective}
					class="w-full appearance-none px-3 pr-12 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
				>
                    {#each workspace.getPerspectives() as p}
                        <option value={p.id}>{p.name}</option>
                    {/each}
				</select>
				<ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400" />
			</div>

			<!-- Actions aligned bottom on md+ -->
            <div class="flex items-center justify-end gap-2 mt-2 md:mt-auto">
                <button type="button" class="btn btn-base bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300" onclick={handleCancel} disabled={submitting}>Cancel</button>
                <button type="submit" class="btn btn-base bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50" disabled={submitting || !title.trim()}>Save</button>
			</div>
		</div>
	</div>
</form>
