<script lang="ts">
import type { Task, WorkspaceData, NavigationState } from '$lib/types';
import { findPerspective, findProject, getPerspectives, getProjects } from '$lib/helpers/workspaceHelpers';
import { 
  sortTasksByPerspectiveThenOrder, 
  sortTasksByProjectThenOrder, 
  groupTasksByProject, 
  groupTasksByPerspective 
} from './taskOperations';
import UiTaskItem from './UiTaskItem.svelte';
import TaskInlineEditor from './TaskInlineEditor.svelte';
import TaskListHeader from './TaskListHeader.svelte';
import TaskListEmpty from './TaskListEmpty.svelte';
import TaskGroupComponent from './TaskGroup.svelte';

// Define TaskGroup type locally
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

	// Derived values using props directly
	const activeTasks = $derived(tasks.filter(t => !t.completed));
	const completedTasks = $derived(tasks.filter(t => t.completed));
	
	const viewTitle = $derived.by(() => {
		const currentProject = navigation.currentProjectId 
			? findProject(workspace, navigation.currentProjectId) 
			: undefined;
			
		const currentPerspective = navigation.currentPerspectiveId
			? findPerspective(workspace, navigation.currentPerspectiveId)
			: undefined;

		switch (navigation.currentView) {
			case 'all': return 'All';
			case 'project-all': return 'All Projects';
			case 'project': return currentProject?.name || 'Project';
			case 'perspective': return currentPerspective?.name || 'Tasks';
			default: return 'Tasks';
		}
	});

	const groupingType = $derived.by(() => {
		switch (navigation.currentView) {
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

	const taskGroups = $derived.by(() => {
		const groups: TaskGroup[] = [];
		const type = groupingType;

		if (type === 'project') {
			// Group by project (used in perspective and all views)
			const tasksByProject = groupTasksByProject(activeTasks);
			const ungroupedTasks = activeTasks.filter(t => !t.projectId);

			// Add Actions section for ungrouped tasks
			if (ungroupedTasks.length > 0) {
				groups.push({
					id: 'actions',
					title: 'Actions',
					tasks: sortTasksByPerspectiveThenOrder(ungroupedTasks, getPerspectives(workspace))
				});
			}

			// Add project groups sorted by project order
			const sortedProjects = [...tasksByProject.entries()].sort(([idA], [idB]) => {
				const projectA = findProject(workspace, idA);
				const projectB = findProject(workspace, idB);
				return (projectA?.order ?? 0) - (projectB?.order ?? 0);
			});

			sortedProjects.forEach(([projectId, tasks]) => {
				const project = findProject(workspace, projectId);
				groups.push({
					id: `project-${projectId}`,
					title: project?.name || projectId,
					tasks: sortTasksByPerspectiveThenOrder(tasks, getPerspectives(workspace))
				});
			});
		} else if (type === 'perspective') {
			// Group by perspective (used in project and project-all views)
			const tasksByPerspective = groupTasksByPerspective(activeTasks, getPerspectives(workspace));
			
			// Add perspective groups in order
			getPerspectives(workspace).forEach(perspective => {
				const tasks = tasksByPerspective.get(perspective.id) || [];
				if (tasks.length > 0) {
					// Sort differently based on specific view
					const sortedTasks = navigation.currentView === 'project-all' 
						? sortTasksByProjectThenOrder(tasks, getProjects(workspace))
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
			if (activeTasks.length > 0) {
				groups.push({
					id: 'all',
					title: 'Tasks',
					tasks: activeTasks.sort((a, b) => a.order - b.order)
				});
			}
		}

		return groups;
	});

	const showProjectBadge = $derived(
		groupingType !== 'project' && navigation.currentView !== 'project'
	);

	const showPerspectiveBadge = $derived(
		groupingType !== 'perspective' && navigation.currentView !== 'perspective'
	);

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
	<TaskListHeader 
		title={viewTitle}
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