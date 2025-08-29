<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { db } from '$lib/api/persistence/localStorageAdapter';
	import { toUpdateTaskRequest, toCreateTaskRequest } from '$lib/api/persistence/mappers';
	import { invalidateAll } from '$app/navigation';
	import TaskList from '$lib/components/TaskList.svelte';
	import TaskEditorForm from '$lib/components/TaskEditorForm.svelte';
	import { NavigationService } from '$lib/services/navigation';
	import { TaskService } from '$lib/services/tasks';
	import { handleKeyboardShortcut } from '$lib/services/pageHandlers';
	import type { Task } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	
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

		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	async function handleTaskToggle(id: string) {
		try {
			const task = currentTasks.find(t => t.id === id);
			if (task) {
				const wsApi = db.forWorkspace(workspaceContext.id);
				await wsApi.updateTask(id, { completed: !task.completed });
				await invalidateAll();
			}
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

	function handleCleanup() {
		console.log('Cleanup triggered');
	}
	
	function createNewTaskWithDefaults(): Task {
		return TaskService.createNewTaskWithDefaults(workspaceContext, currentNavigation);
	}

	async function handleRefresh() {
		await invalidateAll();
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

	function handleKeydown(event: KeyboardEvent) {
		handleKeyboardShortcut(event, {
			onNewTask: () => { showCreateEditor = true; },
			onEscape: showCreateEditor ? () => { showCreateEditor = false; } : undefined
		});
	}
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<TaskList
		tasks={currentTasks}
		workspace={workspaceContext}
		navigation={currentNavigation}
		onTaskToggle={handleTaskToggle}
		onUpdateTask={async (id, updates) => {
			const wsApi = db.forWorkspace(workspaceContext.id);
			await wsApi.updateTask(id, toUpdateTaskRequest(updates));
			await invalidateAll();
		}}
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
						const taskData = TaskService.prepareTaskForCreation(
							{ title, description, projectId, perspectiveId: perspective },
							workspaceContext.id
						);
						const wsApi = db.forWorkspace(workspaceContext.id);
						await wsApi.createTask(toCreateTaskRequest(taskData));
						await invalidateAll();
						handleCreateClose();
					}}
					on:close={handleCreateClose}
				/>
			</div>
		</div>
	{/if}
</div>