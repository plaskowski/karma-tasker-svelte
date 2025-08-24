<script lang="ts">
	import type { Task, ViewType, Project } from '$lib/types';
	import { Calendar, Plus, RefreshCw, Zap } from 'lucide-svelte';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		tasks: Task[];
		projects: Project[];
		currentView: ViewType;
		currentProjectId?: string;
		onTaskToggle: (id: string) => void;
		onTaskStar: (id: string) => void;
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
		currentProjectId,
		onTaskToggle,
		onTaskStar,
		onTaskClick,
		showCompleted = false,
		onNewTask,
		onCleanup,
		onRefresh
	}: Props = $props();

	function getViewTitle() {
		switch (currentView) {
			case 'focus':
				return 'Focus';
			case 'inbox':
				return 'Inbox';
			case 'next':
				return 'Next';
			case 'waiting':
				return 'Waiting';
			case 'scheduled':
				return 'Scheduled';
			case 'someday':
				return 'Someday';
			case 'project':
				if (currentProjectId) {
					const project = projects.find(p => p.id === currentProjectId);
					return project ? project.name : 'Project';
				}
				return 'Project';
			default:
				return 'Tasks';
		}
	}



	const activeTasks = $derived(tasks.filter(task => !task.completed));
	const completedTasks = $derived(tasks.filter(task => task.completed));

	// Rotating motivational headers for Focus view - diverse positive energy with nostalgia
	const focusHeaders = [
		"Let's Roll",
		"In the Zone",
		"Making Magic",
		"Pure Focus",
		"Feeling Good",
		"Ready to Shine",
		"Somebody Stop Me",
		"Legendary",
		"Challenge Accepted",
		"Bazinga",
		"It's Morphin Time",
		"Go Go Power Rangers",
		"My Precious",
		"For Frodo",
		"You Have My Sword",
		"Walking on Sunshine",
		"You're a Wizard Harry",
		"Expecto Patronum",
		"Work Work",
		"My Life for Aiur",
		"Like a Boss",
		"High Five",
		"Gotta Catch 'Em All",
		"Pika pika?",
		"Avengers Assemble",
		"I Am Iron Man",
		"We Have a Hulk",
		"Use the Force",
		"Nobody Expects the Spanish Inquisition",
		"I am dancing in the rain"
	];
	
	// Pick random header on component initialization
	const focusHeader = focusHeaders[Math.floor(Math.random() * focusHeaders.length)];

	// Group tasks by project for certain views
	const shouldGroupByProject = $derived(['inbox', 'next', 'waiting', 'someday', 'scheduled'].includes(currentView));
	const shouldGroupByPerspective = $derived(['project'].includes(currentView));
	
	function groupTasksByProject(taskList: Task[]) {
		if (!shouldGroupByProject) return { ungrouped: taskList };
		
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
		
		return { grouped, ungrouped };
	}



	function groupTasksByPerspective(taskList: Task[]) {
		if (!shouldGroupByPerspective) return { ungrouped: taskList };
		
		const perspectiveGroups = {
			inbox: [] as Task[],
			next: [] as Task[],
			waiting: [] as Task[],
			scheduled: [] as Task[],
			someday: [] as Task[]
		};
		
		taskList.forEach(task => {
			if (task.starred && !task.completed) {
				perspectiveGroups.next.push(task);
			} else if (task.dueDate && !task.completed) {
				perspectiveGroups.scheduled.push(task);
			} else if (!task.starred && !task.dueDate && !task.completed) {
				// For now, put unscheduled, unstarred tasks in waiting
				// This logic can be refined based on other criteria
				perspectiveGroups.waiting.push(task);
			} else if (!task.completed) {
				perspectiveGroups.inbox.push(task);
			}
		});
		
		return perspectiveGroups;
	}

	const { grouped: groupedActiveTasks = {}, ungrouped: ungroupedActiveTasks = [] } = $derived(groupTasksByProject(activeTasks));
	const perspectiveGroupedActiveTasks = $derived(groupTasksByPerspective(activeTasks));

	function getProjectName(projectId: string): string {
		return projects.find(p => p.id === projectId)?.name || projectId;
	}

	function getPerspectiveGroupLabel(groupKey: string): string {
		switch (groupKey) {
			case 'inbox': return 'Inbox';
			case 'next': return 'Next';
			case 'waiting': return 'Waiting';
			case 'scheduled': return 'Scheduled';
			case 'someday': return 'Someday';
			default: return groupKey;
		}
	}

	// Unified task groups for rendering
	const taskGroups = $derived(() => {
		const groups: Array<{
			id: string;
			title: string; 
			tasks: Task[];
			showCount?: boolean;
			needsDivider?: boolean;
		}> = [];

		// Focus view - single group
		if (!shouldGroupByProject && !shouldGroupByPerspective) {
			if (activeTasks.length > 0) {
				groups.push({
					id: 'focus',
					title: focusHeader,
					tasks: activeTasks,
					needsDivider: false
				});
			}
		}
		// Project-grouped views (Inbox, Next, Waiting, etc.)
		else if (shouldGroupByProject) {
			// Add Actions section if there are ungrouped tasks
			if (ungroupedActiveTasks.length > 0) {
				groups.push({
					id: 'actions',
					title: 'Actions',
					tasks: ungroupedActiveTasks,
					needsDivider: Object.keys(groupedActiveTasks).length > 0
				});
			}
			
			// Add project groups
			Object.entries(groupedActiveTasks).forEach(([projectId, tasks]) => {
				groups.push({
					id: `project-${projectId}`,
					title: getProjectName(projectId),
					tasks,
					needsDivider: true
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
					tasks,
					showCount: true,
					needsDivider: true
				});
			});
		}

		return groups;
	});

	const showProjectBadge = $derived(!shouldGroupByProject && !shouldGroupByPerspective);


</script>

<div class="flex-1 flex flex-col h-full">
	<!-- Header -->
	<div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-lg font-medium text-gray-900 dark:text-gray-100">{getViewTitle()}</h1>
			</div>
			
			<div class="flex items-center gap-2">
				{#if onNewTask}
					<button
						onclick={onNewTask}
						class="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors flex items-center gap-2"
					>
						<Plus class="w-4 h-4" />
						<span>New Item</span>
					</button>
				{/if}
				
				{#if onCleanup}
					<button
						onclick={onCleanup}
						class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
					>
						<Zap class="w-4 h-4" />
						<span>Cleanup</span>
					</button>
				{/if}
				
				{#if onRefresh}
					<button
						onclick={onRefresh}
						class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
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
					<div class="mb-3">
						<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 {group.id.startsWith('project-') ? 'capitalize' : ''} {group.showCount ? 'flex items-center gap-2' : ''}">
							<span>{group.title}</span>
							{#if group.showCount}
								<span class="text-xs opacity-60">({group.tasks.length})</span>
							{/if}
						</h3>
					</div>
					{#each group.tasks as task (task.id)}
						<TaskItem
							{task}
							onToggle={onTaskToggle}
							onStar={onTaskStar}
							onClick={onTaskClick}
							{showProjectBadge}
						/>
					{/each}
					{#if group.needsDivider}
						<div class="py-4">
							<div class="border-t border-gray-200 dark:border-gray-700"></div>
						</div>
					{/if}
				{/each}

				<!-- Completed Tasks -->
				{#if (showCompleted || completedTasks.length > 0) && completedTasks.length > 0}
					{#if activeTasks.length > 0}
						<div class="py-4">
							<div class="border-t border-gray-200 dark:border-gray-700"></div>
						</div>
					{/if}
					<div class="mb-3">
						<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Done</h3>
					</div>
					{#each completedTasks as task (task.id)}
						<TaskItem
							{task}
							onToggle={onTaskToggle}
							onStar={onTaskStar}
							onClick={onTaskClick}
							{showProjectBadge}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>