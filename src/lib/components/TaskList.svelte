<script lang="ts">
import type { Task, WorkspaceData, NavigationState } from '$lib/types';
import { Calendar, Plus, RefreshCw, Zap } from 'lucide-svelte';
	import UiTaskItem from './UiTaskItem.svelte';
	import TaskInlineEditor from './TaskInlineEditor.svelte';
	import { createTaskListStore } from '$lib/features/tasklist/tasklist.store';

	interface Props {
		tasks: Task[];
		workspace: WorkspaceData;
		navigation: NavigationState;
		onTaskToggle: (id: string) => void | Promise<void>;
		onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
		showCompleted?: boolean;
		onNewTask?: () => void;
		onCleanup?: () => void;
		onRefresh?: () => void;
	}

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

	// Create task list store
	const store = createTaskListStore({
		tasks,
		workspace,
		navigation,
		showCompleted
	});

	// Extract derived stores
	const { 
		state: storeState,
		viewTitle, 
		activeTasks, 
		completedTasks, 
		taskGroups,
		showProjectBadge,
		showPerspectiveBadge
	} = store;

	// Update store when props change
	$effect(() => {
		store.updateData({ tasks, workspace, navigation, showCompleted });
	});

	// Close inline editor when view changes
	$effect(() => {
		navigation;
		store.closeInlineEditor();
	});
</script>

<div class="flex-1 flex flex-col h-full">
	<!-- Header -->
	<div class="topbar">
		<div class="flex items-center justify-between w-full">
			<div>
				<h1 class="text-lg font-medium text-gray-900 dark:text-gray-100">{$viewTitle}</h1>
			</div>
			
			<div class="flex items-center gap-2">
				{#if onNewTask}
					<button
						onclick={onNewTask}
						class="btn btn-base btn-outline"
						title="Create new task (N or Ctrl+N)"
					>
						<Plus class="w-4 h-4" />
						<span>New Item</span>
					</button>
				{/if}
				
				{#if onCleanup}
					<button
						onclick={onCleanup}
						class="btn btn-base btn-outline"
					>
						<Zap class="w-4 h-4" />
						<span>Cleanup</span>
					</button>
				{/if}
				
				{#if onRefresh}
					<button
						onclick={onRefresh}
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
		{#if tasks.length === 0}
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-gray-500 dark:text-gray-400">
					<Calendar class="w-8 h-8 mx-auto mb-2 opacity-50" />
					<p>No tasks found</p>
				</div>
			</div>
		{:else}
			<div class="p-6 space-y-1">
				<!-- Active task groups -->
				{#each $taskGroups as group}
					<div class="mb-6">
						<div class="mb-3">
							<h3 class="text-base font-medium text-gray-500 dark:text-gray-400 {group.id.startsWith('project-') ? 'capitalize' : ''}">
								<span>{group.title}</span>
							</h3>
						</div>
						{#each group.tasks as task (task.id)}
							{#if store.isEditingTask(task.id)}
								<TaskInlineEditor
									{task}
									{workspace}
									onUpdateTask={onUpdateTask}
									on:close={store.closeInlineEditor}
								/>
							{:else}
								<div
									onclick={() => store.toggleInlineEditor(task.id)}
									onkeydown={(e) => e.key === 'Enter' && store.toggleInlineEditor(task.id)}
									role="button"
									tabindex="0"
									class="cursor-pointer"
								>
									<UiTaskItem
										{task}
										onToggle={onTaskToggle}
										showProjectBadge={$showProjectBadge}
										showPerspectiveBadge={$showPerspectiveBadge}
										perspectiveName={store.getTaskPerspectiveName(task)}
										projectName={store.getTaskProjectName(task)}
									/>
								</div>
							{/if}
						{/each}
					</div>
				{/each}

				<!-- Completed Tasks -->
				{#if (showCompleted || $completedTasks.length > 0) && $completedTasks.length > 0}
					<div class="mb-3">
						<h3 class="text-base font-medium text-gray-500 dark:text-gray-400">Done</h3>
					</div>
					{#each $completedTasks as task (task.id)}
						<UiTaskItem
							{task}
							onToggle={onTaskToggle}
							showProjectBadge={$showProjectBadge}
							showPerspectiveBadge={$showPerspectiveBadge}
							perspectiveName={store.getTaskPerspectiveName(task)}
							projectName={store.getTaskProjectName(task)}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>