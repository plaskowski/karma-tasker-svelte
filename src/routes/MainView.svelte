<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import TaskEditorForm from '$lib/components/TaskEditorForm.svelte';
	import { NavigationService } from '$lib/services/navigation';
	import { TaskService } from '$lib/services/tasks';
	import { keyboard } from '$lib/actions/keyboard';
	import type { Task } from '$lib/types';
	import type { PageData } from './$types';

	interface MainViewProps {
		data: PageData;
		onTaskToggle: (id: string) => Promise<void>;
		onUpdateTask: (id: string, updates: any) => Promise<void>;
		onCreateTask: (taskData: { title: string; description?: string; projectId: string; perspective: string }) => Promise<void>;
		onRefresh: () => Promise<void>;
		onClearCompleted: () => Promise<void>;
	}

	let { data, onTaskToggle, onUpdateTask, onCreateTask, onRefresh, onClearCompleted }: MainViewProps = $props();

	let workspaceContext = $derived(data.workspaceContext);
	let currentTasks = $derived(data.tasks);
	let currentNavigation = $derived(data.navigation);

	let showCreateEditor = $state(false);
	let createEditorEl = $state<HTMLElement | null>(null);

	onMount(() => {
		NavigationService.updateURLIfChanged(
			$page.url.searchParams,
			currentNavigation,
			{ workspaceId: workspaceContext.id }
		);
	});

	async function handleTaskToggle(id: string) {
		try {
			await onTaskToggle(id);
		} catch (error) {
			console.error('Failed to toggle task:', error);
		}
	}

	function handleNewTask() {
		showCreateEditor = true;
	}

	function handleCreateClose() {
		showCreateEditor = false;
	}

	function handleEscape() {
		if (showCreateEditor) {
			showCreateEditor = false;
		}
	}

	async function handleCleanup() {
		await onClearCompleted();
	}

	function createNewTaskWithDefaults(): Task {
		return TaskService.createNewTaskWithDefaults(workspaceContext, currentNavigation);
	}

	async function handleRefresh() {
		await onRefresh();
	}

	$effect(() => {
		if (showCreateEditor && createEditorEl) {
			createEditorEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}
	});

	$effect(() => {
		currentNavigation;
		showCreateEditor = false;
	});
</script>

<div
	class="flex-1 flex flex-col overflow-hidden"
	use:keyboard={{
		'n': handleNewTask,
		'escape': handleEscape
	}}
	tabindex="-1"
>
	<TaskList
		tasks={currentTasks}
		workspace={workspaceContext}
		navigation={currentNavigation}
		onTaskToggle={handleTaskToggle}
		onUpdateTask={onUpdateTask}
		showCompleted={true}
		onNewTask={handleNewTask}
		onCleanup={handleCleanup}
		onRefresh={handleRefresh}
	/>

	{#if showCreateEditor}
		<div class="border-t border-gray-200 dark:border-gray-700 px-6 py-4" bind:this={createEditorEl}>
			<div 
				class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
				role="dialog"
				aria-label="Create new task"
				data-testid="task-editor-panel"
			>
				<TaskEditorForm
					task={createNewTaskWithDefaults()}
					workspace={workspaceContext}
					save={async ({ title, description, projectId, perspective }) => {
						if (!projectId || !perspective) {
							throw new Error('Project and perspective are required for task creation');
						}
						await onCreateTask({ title, description, projectId, perspective });
						handleCreateClose();
					}}
					on:close={handleCreateClose}
				/>
			</div>
		</div>
	{/if}
</div>