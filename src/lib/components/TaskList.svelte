<script lang="ts">
	import type { Task, ViewType, Project } from '$lib/types';
	import { Calendar, RefreshCw, Zap } from 'lucide-svelte';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		tasks: Task[];
		projects: Project[];
		currentView: ViewType;
		onTaskToggle: (id: string) => void;
		onTaskStar: (id: string) => void;
		onTaskClick: (task: Task) => void;

		showCompleted?: boolean;
		onCleanup?: () => void;
		onRefresh?: () => void;
	}

	let {
		tasks,
		projects,
		currentView,
		onTaskToggle,
		onTaskStar,
		onTaskClick,
		showCompleted = false,
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
				return 'Project';
			default:
				return 'Tasks';
		}
	}



	const activeTasks = $derived(tasks.filter(task => !task.completed));
	const completedTasks = $derived(tasks.filter(task => task.completed));

	// Group tasks by project for certain views
	const shouldGroupByProject = $derived(['inbox', 'next', 'waiting', 'someday', 'scheduled'].includes(currentView));
	const shouldGroupByTime = $derived(['project'].includes(currentView));
	
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

	function groupTasksByTime(taskList: Task[]) {
		if (!shouldGroupByTime) return { ungrouped: taskList };
		
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const endOfWeek = new Date(today);
		endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
		
		const timeGroups = {
			overdue: [] as Task[],
			today: [] as Task[],
			tomorrow: [] as Task[],
			thisWeek: [] as Task[],
			later: [] as Task[]
		};
		
		taskList.forEach(task => {
			const dueDate = task.dueDate ? new Date(task.dueDate) : null;
			
			if (!dueDate) {
				// Tasks without due dates go to "later"
				timeGroups.later.push(task);
				return;
			}
			
			const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
			
			if (taskDate < today) {
				timeGroups.overdue.push(task);
			} else if (taskDate.getTime() === today.getTime()) {
				timeGroups.today.push(task);
			} else if (taskDate.getTime() === tomorrow.getTime()) {
				timeGroups.tomorrow.push(task);
			} else if (taskDate <= endOfWeek) {
				timeGroups.thisWeek.push(task);
			} else {
				timeGroups.later.push(task);
			}
		});
		
		return timeGroups;
	}

	const { grouped: groupedActiveTasks = {}, ungrouped: ungroupedActiveTasks = [] } = $derived(groupTasksByProject(activeTasks));
	const timeGroupedActiveTasks = $derived(groupTasksByTime(activeTasks));

	function getProjectName(projectId: string): string {
		return projects.find(p => p.id === projectId)?.name || projectId;
	}

	function getTimeGroupLabel(groupKey: string): string {
		switch (groupKey) {
			case 'overdue': return 'Overdue';
			case 'today': return 'Today';
			case 'tomorrow': return 'Tomorrow';
			case 'thisWeek': return 'This Week';
			case 'later': return 'Later';
			default: return groupKey;
		}
	}


</script>

<div class="flex-1 flex flex-col h-full">
	<!-- Header -->
	<div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-lg font-medium text-gray-900 dark:text-gray-100">{getViewTitle()}</h1>
			</div>
			
			<div class="flex items-center gap-2">
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
							<!-- Ungrouped Active Tasks (Actions section) - Only for project-grouped views -->
			{#if shouldGroupByProject && ungroupedActiveTasks.length > 0}
				<div class="mb-3">
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Actions</h3>
				</div>
				{#each ungroupedActiveTasks as task (task.id)}
					<TaskItem
						{task}
						onToggle={onTaskToggle}
						onStar={onTaskStar}
						onClick={onTaskClick}

						showProjectBadge={!shouldGroupByProject && !shouldGroupByTime}
					/>
				{/each}
				{#if Object.keys(groupedActiveTasks).length > 0}
					<div class="py-4">
						<div class="border-t border-gray-200 dark:border-gray-700"></div>
					</div>
				{/if}
			{/if}

							<!-- Grouped Active Tasks by Project - Only for project-grouped views -->
			{#if shouldGroupByProject}
				{#each Object.entries(groupedActiveTasks) as [projectId, projectTasks]}
					<div>
						<div class="mb-3">
							<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
								{getProjectName(projectId)}
							</h3>
						</div>
						{#each projectTasks as task (task.id)}
							<TaskItem
								{task}
								onToggle={onTaskToggle}
								onStar={onTaskStar}
								onClick={onTaskClick}
		
								showProjectBadge={!shouldGroupByProject && !shouldGroupByTime}
							/>
						{/each}
						<div class="py-4">
							<div class="border-t border-gray-200 dark:border-gray-700"></div>
						</div>
					</div>
				{/each}
			{/if}

				<!-- Time-grouped view (for project views) -->
				{#if shouldGroupByTime}
					{@const nonEmptyGroups = Object.entries(timeGroupedActiveTasks).filter(([_, tasks]) => tasks.length > 0)}
					{#each nonEmptyGroups as [groupKey, groupTasks], index}
						<div class="mb-6">
							<div class="mb-3">
								<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
									<span>{getTimeGroupLabel(groupKey)}</span>
									<span class="text-xs opacity-60">({groupTasks.length})</span>
								</h3>
							</div>
							{#each groupTasks as task (task.id)}
								<TaskItem
									{task}
									onToggle={onTaskToggle}
									onStar={onTaskStar}
									onClick={onTaskClick}
			
									showProjectBadge={!shouldGroupByProject && !shouldGroupByTime}
								/>
							{/each}
							{#if index < nonEmptyGroups.length - 1}
								<div class="py-4">
									<div class="border-t border-gray-200 dark:border-gray-700"></div>
								</div>
							{/if}
						</div>
					{/each}
				{/if}

				<!-- Non-grouped view (for focus, inbox views) -->
				{#if !shouldGroupByProject && !shouldGroupByTime}
					{#each activeTasks as task (task.id)}
						<TaskItem
							{task}
							onToggle={onTaskToggle}
							onStar={onTaskStar}
							onClick={onTaskClick}
	
							showProjectBadge={!shouldGroupByProject && !shouldGroupByTime}
						/>
					{/each}
				{/if}

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
	
							showProjectBadge={!shouldGroupByProject && !shouldGroupByTime}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>