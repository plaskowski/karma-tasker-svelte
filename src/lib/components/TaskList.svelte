<script lang="ts">
import type { Task, WorkspaceData, NavigationState } from '$lib/types';
import { findPerspective, findProject } from '$lib/helpers/workspaceHelpers';
import UiTaskItem from './UiTaskItem.svelte';
import TaskInlineEditor from './TaskInlineEditor.svelte';
import TaskListHeader from './TaskListHeader.svelte';
import TaskListEmpty from './TaskListEmpty.svelte';
import TaskGroupComponent from './TaskGroup.svelte';
import { 
  getTaskGroups, 
  shouldShowProjectBadge, 
  shouldShowPerspectiveBadge
} from './taskGrouping';

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

	// Local state for inline editing
	let inlineEditingTaskId: string | null = $state(null);

	// Derived values using props directly
	const activeTasks = $derived(tasks.filter(t => !t.completed));
	const completedTasks = $derived(tasks.filter(t => t.completed));

	// Use the extracted grouping functions
	const taskGroups = $derived(getTaskGroups(activeTasks, navigation, workspace));
	const showProjectBadge = $derived(shouldShowProjectBadge(navigation));
	const showPerspectiveBadge = $derived(shouldShowPerspectiveBadge(navigation));

	// Helper methods
	function getTaskProjectName(task: Task): string {
		const project = findProject(workspace, task.projectId);
		return project?.name || task.projectId;
	}

	function getTaskPerspectiveName(task: Task): string {
		const perspective = findPerspective(workspace, task.perspectiveId);
		return perspective?.name || task.perspectiveId;
	}

	function toggleInlineEditor(taskId: string) {
		inlineEditingTaskId = inlineEditingTaskId === taskId ? null : taskId;
	}

	function closeInlineEditor() {
		inlineEditingTaskId = null;
	}

	function isEditingTask(taskId: string): boolean {
		return inlineEditingTaskId === taskId;
	}

	// Close inline editor when view changes
	$effect(() => {
		navigation;
		closeInlineEditor();
	});
</script>

<div class="flex-1 flex flex-col h-full">
	<!-- Header -->
	<TaskListHeader 
		{navigation}
		{workspace}
		{onNewTask}
		{onCleanup}
		{onRefresh}
	/>

	<!-- Task List Content -->
	<div class="flex-1 overflow-auto">
		{#if tasks.length === 0}
			<TaskListEmpty />
		{:else}
			<div class="p-6 space-y-1">
				<!-- Active task groups -->
				{#each taskGroups as group}
					<TaskGroupComponent
						title={group.title}
						tasks={group.tasks}
						{workspace}
						isGroupTitle={true}
						showProjectBadge={showProjectBadge}
						showPerspectiveBadge={showPerspectiveBadge}
						{getTaskProjectName}
						{getTaskPerspectiveName}
						{isEditingTask}
						{toggleInlineEditor}
						{closeInlineEditor}
						{onTaskToggle}
						{onUpdateTask}
					/>
				{/each}

				<!-- Completed Tasks -->
				{#if (showCompleted || completedTasks.length > 0) && completedTasks.length > 0}
					<div class="mb-3">
						<h3 class="text-base font-medium text-gray-500 dark:text-gray-400">Done</h3>
					</div>
					{#each completedTasks as task (task.id)}
						<UiTaskItem
							{task}
							onToggle={onTaskToggle}
							showProjectBadge={showProjectBadge}
							showPerspectiveBadge={showPerspectiveBadge}
							perspectiveName={getTaskPerspectiveName(task)}
							projectName={getTaskProjectName(task)}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>