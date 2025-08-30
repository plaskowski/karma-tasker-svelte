<script lang="ts">
	import SidebarView from './SidebarView.svelte';
	import MainView from './MainView.svelte';
	import { invalidateAll } from '$app/navigation';
	import { db } from '$lib/api/persistence/localStorageAdapter';
	import { toUpdateTaskRequest, toCreateTaskRequest } from '$lib/api/persistence/mappers';
	import { TaskService } from '$lib/services/tasks';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	async function handleTaskToggle(id: string) {
		const task = data.tasks.find(t => t.id === id);
		if (task) {
			const wsApi = db.forWorkspace(data.workspaceContext.id);
			await wsApi.updateTask(id, { completed: !task.completed });
			await invalidateAll();
		}
	}
	
	async function handleUpdateTask(id: string, updates: any) {
		const wsApi = db.forWorkspace(data.workspaceContext.id);
		await wsApi.updateTask(id, toUpdateTaskRequest(updates));
		await invalidateAll();
	}
	
	async function handleCreateTask(taskData: { title: string; description?: string; projectId: string; perspective: string }) {
		if (!taskData.projectId || !taskData.perspective) {
			throw new Error('Project and perspective are required for task creation');
		}
		const preparedTask = TaskService.prepareTaskForCreation(
			{ 
				title: taskData.title, 
				description: taskData.description, 
				projectId: taskData.projectId, 
				perspectiveId: taskData.perspective 
			}
		);
		const wsApi = db.forWorkspace(data.workspaceContext.id);
		await wsApi.createTask(toCreateTaskRequest(preparedTask));
		await invalidateAll();
	}
	
	async function handleRefresh() {
		// Load mock data if storage is empty
		if (typeof window !== 'undefined') {
			const { db } = await import('$lib/api/persistence/localStorageAdapter');
			db.initializeWithMockData();
		}
		await invalidateAll();
	}
	
	async function handleClearCompleted() {
		await TaskService.clearCompletedTasks(data.workspaceContext.id, data.tasks);
		await invalidateAll();
	}
</script>

<div class="h-full flex dark">
	<SidebarView {data} />
	<MainView 
		{data} 
		onTaskToggle={handleTaskToggle}
		onUpdateTask={handleUpdateTask}
		onCreateTask={handleCreateTask}
		onRefresh={handleRefresh}
		onClearCompleted={handleClearCompleted}
	/>
</div>