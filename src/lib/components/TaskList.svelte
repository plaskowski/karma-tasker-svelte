<script lang="ts">
import type { Task, WorkspaceData } from '$lib/types';
	import { Calendar, Plus, RefreshCw, Zap } from 'lucide-svelte';
	import { writable } from 'svelte/store';
	import UiTaskItem from './UiTaskItem.svelte';
	import TaskInlineEditor from './TaskInlineEditor.svelte';
	import { createTaskListViewModel } from './taskListViewModel';
	import type { TaskListViewState, TaskListActions } from './taskListViewModel';

interface Props extends TaskListViewState, TaskListActions {}

	let {
		tasks,
		workspace,
		navigation,
		onTaskToggle,
		onUpdateTask,
		showCompleted = false,
		onNewTask,
		onCleanup,
		onRefresh
	}: Props = $props();

	// Inline editor state as a store
	const inlineEditingTaskId = writable<string | null>(null);
	
	// Build view state - no complex expressions
    const viewState = $derived<TaskListViewState>({
		tasks,
        workspace: workspace as WorkspaceData,
		navigation,
		showCompleted
	});

	// Define actions
	const actions: TaskListActions = {
		onTaskToggle,
		onUpdateTask,
		onNewTask,
		onCleanup,
		onRefresh
	};

	// Create view model with inline editing store
	const vm = $derived(createTaskListViewModel(
		viewState, 
		actions,
		inlineEditingTaskId
	));

	// Close inline editor when view changes
	$effect(() => {
		navigation;
		vm.closeInlineEditor();
	});
</script>

<div class="flex-1 flex flex-col h-full">
	<!-- Header -->
	<div class="topbar">
		<div class="flex items-center justify-between w-full">
			<div>
				<h1 class="text-lg font-medium text-gray-900 dark:text-gray-100">{vm.viewTitle}</h1>
			</div>
			
			<div class="flex items-center gap-2">
				{#if vm.showNewTaskButton}
					<button
						onclick={vm.handleNewTask}
						class="btn btn-base btn-outline"
						title="Create new task (N or Ctrl+N)"
					>
						<Plus class="w-4 h-4" />
						<span>New Item</span>
					</button>
				{/if}
				
				{#if vm.showCleanupButton}
					<button
						onclick={vm.handleCleanup}
						class="btn btn-base btn-outline"
					>
						<Zap class="w-4 h-4" />
						<span>Cleanup</span>
					</button>
				{/if}
				
				{#if vm.showRefreshButton}
					<button
						onclick={vm.handleRefresh}
						class="btn btn-base btn-outline"
					>
						<RefreshCw class="w-4 h-4" />
						<span>Refresh</span>
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Task List Content -->
	<div class="flex-1 overflow-auto">
		{#if vm.isEmpty}
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-gray-500 dark:text-gray-400">
					<Calendar class="w-8 h-8 mx-auto mb-2 opacity-50" />
					<p>No tasks found</p>
				</div>
			</div>
		{:else}
			<div class="p-6 space-y-1">
				<!-- Active task groups -->
				{#each vm.taskGroups as group}
					<div class="mb-6">
						<div class="mb-3">
							<h3 class="text-base font-medium text-gray-500 dark:text-gray-400 {vm.getGroupClass(group.id)}">
								<span>{group.title}</span>
							</h3>
						</div>
						{#each group.tasks as task (task.id)}
							{#if vm.isEditingTask(task.id)}
								<TaskInlineEditor
									{task}
									{workspace}
									onUpdateTask={vm.handleUpdateTask}
									on:close={vm.closeInlineEditor}
								/>
							{:else}
								<UiTaskItem
									{task}
									onToggle={vm.handleTaskToggle}
									showProjectBadge={vm.showProjectBadge}
									showPerspectiveBadge={vm.showPerspectiveBadge}
									perspectiveName={vm.getTaskPerspectiveName(task)}
									projectName={vm.getTaskProjectName(task)}
								/>
							{/if}
						{/each}
					</div>
				{/each}

				<!-- Completed Tasks -->
				{#if vm.shouldShowCompletedSection}
					<div class="mb-3">
						<h3 class="text-base font-medium text-gray-500 dark:text-gray-400">Done</h3>
					</div>
					{#each vm.completedTasks as task (task.id)}
						<UiTaskItem
							{task}
							onToggle={vm.handleTaskToggle}
							showProjectBadge={vm.showProjectBadge}
							showPerspectiveBadge={vm.showPerspectiveBadge}
							perspectiveName={vm.getTaskPerspectiveName(task)}
							projectName={vm.getTaskProjectName(task)}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>