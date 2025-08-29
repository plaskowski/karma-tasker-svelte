<script lang="ts">
import type { Task, WorkspaceData, NavigationState } from '$lib/types';
import { Calendar, Plus, RefreshCw, Zap } from 'lucide-svelte';
import UiTaskItem from './UiTaskItem.svelte';
import TaskInlineEditor from './TaskInlineEditor.svelte';
import { writable, derived, get } from 'svelte/store';
import { findPerspective, findProject, getPerspectives, getProjects } from '$lib/helpers/workspaceHelpers';
import { 
  sortTasksByPerspectiveThenOrder, 
  sortTasksByProjectThenOrder, 
  groupTasksByProject, 
  groupTasksByPerspective 
} from './taskOperations';
// Define TaskGroup interface locally
interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}

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

	// Create local store for complex state management
	interface TaskListState {
		tasks: Task[];
		workspace: WorkspaceData;
		navigation: NavigationState;
		showCompleted: boolean;
	}

	const taskListStore = writable<TaskListState>({
		tasks,
		workspace,
		navigation,
		showCompleted
	});

	// Update store when props change
	$effect(() => {
		taskListStore.update(s => ({ 
			...s, 
			tasks, 
			workspace, 
			navigation, 
			showCompleted
		}));
	});

	// Derived values
	const activeTasks = derived(taskListStore, $state => 
		$state.tasks.filter(t => !t.completed)
	);

	const completedTasks = derived(taskListStore, $state => 
		$state.tasks.filter(t => t.completed)
	);

	const viewTitle = derived(taskListStore, $state => {
		const currentProject = $state.navigation.currentProjectId 
			? findProject($state.workspace, $state.navigation.currentProjectId) 
			: undefined;
			
		const currentPerspective = $state.navigation.currentPerspectiveId
			? findPerspective($state.workspace, $state.navigation.currentPerspectiveId)
			: undefined;

		switch ($state.navigation.currentView) {
			case 'all': return 'All';
			case 'project-all': return 'All Projects';
			case 'project': return currentProject?.name || 'Project';
			case 'perspective': return currentPerspective?.name || 'Tasks';
			default: return 'Tasks';
		}
	});

	const groupingType = derived(taskListStore, $state => {
		switch ($state.navigation.currentView) {
			case 'perspective':
			case 'all':
				return 'project';
			case 'project':
			case 'project-all':
				return 'perspective';
			default:
				return 'none';
		}
	});

	const taskGroups = derived([taskListStore, activeTasks, groupingType], ([$state, $activeTasks, $groupingType]) => {
		const groups: TaskGroup[] = [];

		if ($groupingType === 'project') {
			// Group by project (used in perspective and all views)
			const tasksByProject = groupTasksByProject($activeTasks);
			const ungroupedTasks = $activeTasks.filter(t => !t.projectId);

			// Add Actions section for ungrouped tasks
			if (ungroupedTasks.length > 0) {
				groups.push({
					id: 'actions',
					title: 'Actions',
					tasks: sortTasksByPerspectiveThenOrder(ungroupedTasks, getPerspectives($state.workspace))
				});
			}

			// Add project groups sorted by project order
			const sortedProjects = [...tasksByProject.entries()].sort(([idA], [idB]) => {
				const projectA = findProject($state.workspace, idA);
				const projectB = findProject($state.workspace, idB);
				return (projectA?.order ?? 0) - (projectB?.order ?? 0);
			});

			sortedProjects.forEach(([projectId, tasks]) => {
				const project = findProject($state.workspace, projectId);
				groups.push({
					id: `project-${projectId}`,
					title: project?.name || projectId,
					tasks: sortTasksByPerspectiveThenOrder(tasks, getPerspectives($state.workspace))
				});
			});
		} else if ($groupingType === 'perspective') {
			// Group by perspective (used in project and project-all views)
			const tasksByPerspective = groupTasksByPerspective($activeTasks, getPerspectives($state.workspace));
			
			// Add perspective groups in order
			getPerspectives($state.workspace).forEach(perspective => {
				const tasks = tasksByPerspective.get(perspective.id) || [];
				if (tasks.length > 0) {
					// Sort differently based on specific view
					const sortedTasks = $state.navigation.currentView === 'project-all' 
						? sortTasksByProjectThenOrder(tasks, getProjects($state.workspace))
						: tasks.sort((a, b) => a.order - b.order);
					
					groups.push({
						id: `perspective-${perspective.id}`,
						title: perspective.name,
						tasks: sortedTasks
					});
				}
			});
		} else {
			// No grouping - just show all tasks
			if ($activeTasks.length > 0) {
				groups.push({
					id: 'all',
					title: 'Tasks',
					tasks: $activeTasks.sort((a, b) => a.order - b.order)
				});
			}
		}

		return groups;
	});

	const showProjectBadge = derived([taskListStore, groupingType], ([$state, $groupingType]) => {
		return $groupingType !== 'project' && $state.navigation.currentView !== 'project';
	});

	const showPerspectiveBadge = derived([taskListStore, groupingType], ([$state, $groupingType]) => {
		return $groupingType !== 'perspective' && $state.navigation.currentView !== 'perspective';
	});

	// Helper methods
	function getTaskProjectName(task: Task): string {
		if (!task.projectId) return '';
		const project = findProject(workspace, task.projectId);
		return project?.name || task.projectId;
	}

	function getTaskPerspectiveName(task: Task): string {
		if (!task.perspectiveId) return '';
		const perspective = findPerspective(workspace, task.perspectiveId);
		return perspective?.name || '';
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
							{#if isEditingTask(task.id)}
								<TaskInlineEditor
									{task}
									{workspace}
									onUpdateTask={onUpdateTask}
									on:close={closeInlineEditor}
								/>
							{:else}
								<div
									onclick={() => toggleInlineEditor(task.id)}
									onkeydown={(e) => e.key === 'Enter' && toggleInlineEditor(task.id)}
									role="button"
									tabindex="0"
									class="cursor-pointer"
								>
									<UiTaskItem
										{task}
										onToggle={onTaskToggle}
										showProjectBadge={$showProjectBadge}
										showPerspectiveBadge={$showPerspectiveBadge}
										perspectiveName={getTaskPerspectiveName(task)}
										projectName={getTaskProjectName(task)}
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
							perspectiveName={getTaskPerspectiveName(task)}
							projectName={getTaskProjectName(task)}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>