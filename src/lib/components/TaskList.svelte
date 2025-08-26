<script lang="ts">
	import type { Task, ViewType, Project } from '$lib/types';
	import { Calendar, Plus, RefreshCw, Zap } from 'lucide-svelte';
	import TaskItem from './TaskItem.svelte';
	import TaskInlineEditor from './TaskInlineEditor.svelte';
	import { workspacePerspectives } from '$lib/stores/taskStore';

	interface Props {
		tasks: Task[];
		projects: Project[];
		currentView: ViewType;
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
		currentProjectId,
		onTaskToggle,
		onTaskClick,
		showCompleted = false,
		onNewTask,
		onCleanup,
		onRefresh
	}: Props = $props();

	function getViewTitle() {
		switch (currentView) {
			case 'first':
				return 'First';
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

	// Inline editor state
	let inlineEditingTaskId: string | null = $state(null);
	let editorStartHeight: number | null = $state(null);
	let isClosing: boolean = $state(false);
	const rowRefs: Record<string, HTMLDivElement | undefined> = $state({});

	function toggleInlineEditor(taskId: string) {
		if (inlineEditingTaskId === taskId) {
			inlineEditingTaskId = null;
			editorStartHeight = null;
			return;
		}
		const ref = rowRefs[taskId];
		editorStartHeight = ref ? ref.getBoundingClientRect().height : null;
		inlineEditingTaskId = taskId;
	}

	function requestCloseInlineEditor() {
		isClosing = true;
		inlineEditingTaskId = null;
	}

	function handleEditorClosed() {
		editorStartHeight = null;
		isClosing = false;
	}
	const completedTasks = $derived(tasks.filter(task => task.completed));

	// Rotating motivational headers for First view - diverse positive energy with nostalgia
	const firstHeaders = [
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
	const firstHeader = firstHeaders[Math.floor(Math.random() * firstHeaders.length)];

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
			first: [] as Task[],
			next: [] as Task[],
			someday: [] as Task[],
			review: [] as Task[],
			ideas: [] as Task[]
		};
		
		taskList.forEach(task => {
			if (task.completed) return; // Skip completed tasks
			
			// Group by explicit perspective field
			if (!task.perspective) {
				// No perspective = inbox
				perspectiveGroups.inbox.push(task);
			} else if (perspectiveGroups[task.perspective as keyof typeof perspectiveGroups]) {
				perspectiveGroups[task.perspective as keyof typeof perspectiveGroups].push(task);
			} else {
				// Unknown perspective, put in inbox
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
		}> = [];

		// First view - single group
		if (!shouldGroupByProject && !shouldGroupByPerspective) {
			if (activeTasks.length > 0) {
				groups.push({
					id: 'first',
					title: firstHeader,
					tasks: activeTasks
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
						class="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
						title="Create new task (N or Ctrl+N)"
					>
						<Plus class="w-4 h-4" />
						<span>New Item</span>
					</button>
				{/if}
				
				{#if onCleanup}
					<button
						onclick={onCleanup}
						class="btn btn-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
					>
						<Zap class="w-4 h-4" />
						<span>Cleanup</span>
					</button>
				{/if}
				
				{#if onRefresh}
					<button
						onclick={onRefresh}
						class="btn btn-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
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
									startHeight={editorStartHeight || undefined}
									on:close={requestCloseInlineEditor}
									on:closed={handleEditorClosed}
								/>
							{:else}
								<div bind:this={rowRefs[task.id]}>
									{#if !isClosing}
										<TaskItem
										{task}
										onToggle={onTaskToggle}
										onClick={(t) => toggleInlineEditor(t.id)}
										{showProjectBadge}
									/>
									{/if}
								</div>
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