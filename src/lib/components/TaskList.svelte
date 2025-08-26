<script lang="ts">
	import type { Task, ViewType, Project } from '$lib/types';
	import { Calendar, Plus, RefreshCw, Zap } from 'lucide-svelte';
	import TaskItem from './TaskItem.svelte';
	import TaskInlineEditor from './TaskInlineEditor.svelte';
import { workspacePerspectives, workspacePerspectivesOrdered } from '$lib/stores/taskStore';

	interface Props {
		tasks: Task[];
		projects: Project[];
		currentView: ViewType;
		currentPerspectiveId?: string;
		currentProjectId?: string;
		onTaskToggle: (id: string) => void;
		onTaskClick: (task: Task) => void;

		showCompleted?: boolean;
		onNewTask?: () => void;
		onCleanup?: () => void;
		onRefresh?: () => void;
	}

	let {
		tasks,
		projects,
		currentView,
		currentPerspectiveId,
		currentProjectId,
		onTaskToggle,
		onTaskClick,
		showCompleted = false,
		onNewTask,
		onCleanup,
		onRefresh
	}: Props = $props();

	function getViewTitle() {
		// Special views
		if (currentView === 'all') {
			return 'All';
		}
		if (currentView === 'project-all') {
			return 'All Projects';
		}
		if (currentView === 'project') {
			if (currentProjectId) {
				const project = projects.find(p => p.id === currentProjectId);
				return project ? project.name : 'Project';
			}
			return 'Project';
		}
		if (currentView === 'perspective') {
			// Look up perspective name
			const perspective = $workspacePerspectives.find(p => p.id === currentPerspectiveId);
			return perspective?.name || 'Tasks';
		}
		return 'Tasks';
	}



	const activeTasks = $derived(tasks.filter(task => !task.completed));

	// Inline editor state
	let inlineEditingTaskId: string | null = $state(null);

	function toggleInlineEditor(taskId: string) {
		inlineEditingTaskId = inlineEditingTaskId === taskId ? null : taskId;
	}

	function closeInlineEditor() {
		inlineEditingTaskId = null;
	}

	// Close inline editor when view or selected project changes
	$effect(() => {
		const v = currentView;
		const p = currentProjectId;
		inlineEditingTaskId = null;
	});
	const completedTasks = $derived(tasks.filter(task => task.completed));

	// Group tasks by project for certain views
	const shouldGroupByProject = $derived(currentView === 'perspective' || currentView === 'all');
	const shouldGroupByPerspective = $derived(currentView === 'project');
	const shouldGroupByPerspectiveThenProject = $derived(currentView === 'project-all');
	
	function groupTasksByProject(taskList: Task[]) {
		if (!shouldGroupByProject) return { ungrouped: taskList };
		
		// Build perspective order map for sorting within each project group
		const perspectiveOrder = new Map($workspacePerspectivesOrdered.map((p, idx) => [p.id, idx] as const));
		
		const grouped: { [key: string]: Task[] } = {};
		const ungrouped: Task[] = [];
		
		taskList.forEach(task => {
			if (task.projectId) {
				if (!grouped[task.projectId]) grouped[task.projectId] = [];
				grouped[task.projectId].push(task);
			} else {
				ungrouped.push(task);
			}
		});
		
		// Sort tasks inside each project by perspective order, then title
		Object.keys(grouped).forEach(projectId => {
			grouped[projectId].sort((a, b) => {
				const ra = perspectiveOrder.get(a.perspective || '') ?? Number.MAX_SAFE_INTEGER;
				const rb = perspectiveOrder.get(b.perspective || '') ?? Number.MAX_SAFE_INTEGER;
				if (ra !== rb) return ra - rb;
				return a.title.localeCompare(b.title);
			});
		});
		
		return { grouped, ungrouped };
	}



	function groupTasksByPerspective(taskList: Task[]) {
		if (!shouldGroupByPerspective) return { ungrouped: taskList };
		
		const perspectiveGroups: Record<string, Task[]> = {};
		
		// Initialize groups for all workspace perspectives
		$workspacePerspectivesOrdered.forEach(p => {
			perspectiveGroups[p.id] = [];
		});
		
		taskList.forEach(task => {
			if (task.completed) return; // Skip completed tasks
			
			// Group by explicit perspective field
			const perspectiveId = task.perspective || $workspacePerspectivesOrdered[0]?.id;
			
			if (perspectiveId) {
				if (!perspectiveGroups[perspectiveId]) {
					perspectiveGroups[perspectiveId] = [];
				}
				perspectiveGroups[perspectiveId].push(task);
			}
		});
		
		return perspectiveGroups;
	}

	const { grouped: groupedActiveTasks = {}, ungrouped: ungroupedActiveTasks = [] } = $derived(groupTasksByProject(activeTasks));
	const perspectiveGroupedActiveTasks = $derived(groupTasksByPerspective(activeTasks));
	
	// Group tasks by perspective, then order by project within each perspective
	function groupTasksByPerspectiveThenOrderByProject(taskList: Task[]) {
		if (!shouldGroupByPerspectiveThenProject) return {};
		
		const perspectiveGroups: Record<string, Task[]> = {};
		
		// Initialize perspective groups
		$workspacePerspectivesOrdered.forEach(p => {
			perspectiveGroups[p.id] = [];
		});
		
		taskList.forEach(task => {
			if (task.completed) return; // Skip completed tasks
			
			const perspectiveId = task.perspective || $workspacePerspectivesOrdered[0]?.id;
			
			if (!perspectiveGroups[perspectiveId]) {
				perspectiveGroups[perspectiveId] = [];
			}
			
			perspectiveGroups[perspectiveId].push(task);
		});
		
		// Sort tasks within each perspective group by project name, then by task title
		Object.values(perspectiveGroups).forEach(tasks => {
			tasks.sort((a, b) => {
				// First sort by project name
				const projectA = projects.find(p => p.id === a.projectId)?.name || '';
				const projectB = projects.find(p => p.id === b.projectId)?.name || '';
				const projectCompare = projectA.localeCompare(projectB);
				if (projectCompare !== 0) return projectCompare;
				// Then sort by task title
				return a.title.localeCompare(b.title);
			});
		});
		
		return perspectiveGroups;
	}
	
	const perspectiveThenProjectGroups = $derived(groupTasksByPerspectiveThenOrderByProject(activeTasks));

	function getProjectName(projectId: string): string {
		return projects.find(p => p.id === projectId)?.name || projectId;
	}

	function getPerspectiveGroupLabel(groupKey: string): string {
		// Look up the perspective definition to get its proper name
		const perspective = $workspacePerspectives.find(p => p.id === groupKey);
		return perspective?.name || groupKey;
	}

	// Unified task groups for rendering
	const taskGroups = $derived(() => {
		const groups: Array<{
			id: string;
			title: string; 
			tasks: Task[];
		}> = [];

		// Single ungrouped view (for views that don't match any grouping criteria)
		if (!shouldGroupByProject && !shouldGroupByPerspective && !shouldGroupByPerspectiveThenProject) {
			if (activeTasks.length > 0) {
				groups.push({ id: 'ungrouped', title: 'Tasks', tasks: activeTasks });
			}
		}
		// Project-grouped views (Inbox, Next, Waiting, etc.)
		else if (shouldGroupByProject) {
			// Add Actions section if there are ungrouped tasks
			if (ungroupedActiveTasks.length > 0) {
				groups.push({
					id: 'actions',
					title: 'Actions',
					tasks: ungroupedActiveTasks
				});
			}
			
			// Add project groups
			Object.entries(groupedActiveTasks).forEach(([projectId, tasks]) => {
				groups.push({
					id: `project-${projectId}`,
					title: getProjectName(projectId),
					tasks
				});
			});
		}
		// Perspective-grouped views (Project view)
		else if (shouldGroupByPerspective) {
			const nonEmptyGroups = Object.entries(perspectiveGroupedActiveTasks)
				.filter(([_, tasks]) => tasks.length > 0);
				
			nonEmptyGroups.forEach(([groupKey, tasks]) => {
				groups.push({
					id: `perspective-${groupKey}`,
					title: getPerspectiveGroupLabel(groupKey),
					tasks
				});
			});
		}
		// Perspective then Project grouped views (Project All view)
		else if (shouldGroupByPerspectiveThenProject) {
			// Iterate through perspectives in order
			$workspacePerspectivesOrdered.forEach(perspective => {
				const tasks = perspectiveThenProjectGroups[perspective.id];
				if (tasks && tasks.length > 0) {
					groups.push({
						id: `perspective-${perspective.id}`,
						title: perspective.name,
						tasks
					});
				}
			});
		}

		return groups;
	});

	const showProjectBadge = $derived(!shouldGroupByProject && !shouldGroupByPerspective);


</script>

<div class="flex-1 flex flex-col h-full">
	<!-- Header -->
    <div class="topbar">
        <div class="flex items-center justify-between w-full">
			<div>
				<h1 class="text-lg font-medium text-gray-900 dark:text-gray-100">{getViewTitle()}</h1>
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
		{#if activeTasks.length === 0 && completedTasks.length === 0}
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-gray-500 dark:text-gray-400">
					<Calendar class="w-8 h-8 mx-auto mb-2 opacity-50" />
					<p>No tasks found</p>
				</div>
			</div>
		{:else}
			<div class="p-6 space-y-1">
				<!-- Unified task group rendering -->
				{#each taskGroups() as group}
					<div class="mb-6">
						<div class="mb-3">
							<h3 class="text-base font-medium text-gray-500 dark:text-gray-400 {group.id.startsWith('project-') ? 'capitalize' : ''}">
								<span>{group.title}</span>
							</h3>
						</div>
						{#each group.tasks as task (task.id)}
							{#if inlineEditingTaskId === task.id}
								<TaskInlineEditor
									{task}
									projects={projects}
									perspectives={$workspacePerspectives}
									on:close={closeInlineEditor}
								/>
							{:else}
								<TaskItem
									{task}
									onToggle={onTaskToggle}
									onClick={(t) => toggleInlineEditor(t.id)}
									{showProjectBadge}
								/>
							{/if}
						{/each}
					</div>
				{/each}

				<!-- Completed Tasks -->
				{#if (showCompleted || completedTasks.length > 0) && completedTasks.length > 0}
					<div class="mb-3">
						<h3 class="text-base font-medium text-gray-500 dark:text-gray-400">Done</h3>
					</div>
					{#each completedTasks as task (task.id)}
						<TaskItem
							{task}
							onToggle={onTaskToggle}
	
							onClick={onTaskClick}
							{showProjectBadge}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>