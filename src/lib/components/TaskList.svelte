<script lang="ts">
	import type { Task, ViewType, Project } from '$lib/types';
	import { Calendar } from 'lucide-svelte';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		tasks: Task[];
		projects: Project[];
		currentView: ViewType;
		onTaskToggle: (id: string) => void;
		onTaskStar: (id: string) => void;
		onTaskClick: (task: Task) => void;
		onTagClick?: (tag: string) => void;
		showCompleted?: boolean;
	}

	let {
		tasks,
		projects,
		currentView,
		onTaskToggle,
		onTaskStar,
		onTaskClick,
		onTagClick,
		showCompleted = false
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
	const shouldGroupByProject = $derived(['next', 'waiting', 'someday'].includes(currentView));
	
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

	const { grouped: groupedActiveTasks = {}, ungrouped: ungroupedActiveTasks = [] } = $derived(groupTasksByProject(activeTasks));

	function getProjectName(projectId: string): string {
		return projects.find(p => p.id === projectId)?.name || projectId;
	}
</script>

<div class="flex-1 flex flex-col h-full">
	<!-- Header -->
	<div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-lg font-medium text-gray-900 dark:text-gray-100">{getViewTitle()}</h1>
			</div>
			
			<div class="flex items-center gap-1.5 text-xs">
				<button class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-1">
					All
				</button>
				<span class="text-gray-500/60">focus</span>
				<span class="text-gray-500/40">—</span>
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
				<!-- Ungrouped Active Tasks (Actions section) -->
				{#if ungroupedActiveTasks.length > 0}
					<div class="mb-3">
						<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Actions</h3>
					</div>
					{#each ungroupedActiveTasks as task (task.id)}
						<TaskItem
							{task}
							onToggle={onTaskToggle}
							onStar={onTaskStar}
							onClick={onTaskClick}
							{onTagClick}
						/>
					{/each}
					{#if Object.keys(groupedActiveTasks).length > 0}
						<div class="py-4">
							<div class="border-t border-gray-200 dark:border-gray-700"></div>
						</div>
					{/if}
				{/if}

				<!-- Grouped Active Tasks by Project -->
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
								{onTagClick}
							/>
						{/each}
						<div class="py-4">
							<div class="border-t border-gray-200 dark:border-gray-700"></div>
						</div>
					</div>
				{/each}

				<!-- Non-grouped view (for focus, inbox, project views) -->
				{#if !shouldGroupByProject}
					{#each activeTasks as task (task.id)}
						<TaskItem
							{task}
							onToggle={onTaskToggle}
							onStar={onTaskStar}
							onClick={onTaskClick}
							{onTagClick}
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
							{onTagClick}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>