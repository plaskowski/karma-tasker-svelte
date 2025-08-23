<script lang="ts">
	import {
		tasks,
		projects,
		workspaces,
		currentView,
		currentProjectId,
		searchQuery,
		selectedTags,
		filteredTasks,
		focusTaskCount,
		inboxTaskCount,
		nextTaskCount,
		allTags,
		toggleTaskComplete,
		toggleTaskStar,
		addTask
	} from '$lib/stores/taskStore';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import NewTaskDialog from '$lib/components/NewTaskDialog.svelte';
	import type { Task } from '$lib/types';

	// Modal state
	let showNewTaskDialog = $state(false);

	// Handle search changes
	function handleSearchChange(query: string) {
		searchQuery.set(query);
	}

	// Handle view changes
	function handleViewChange(view: import('$lib/types').ViewType) {
		currentView.set(view);
		if (view !== 'project') {
			currentProjectId.set(undefined);
		}
	}

	// Handle project selection
	function handleProjectSelect(projectId: string) {
		currentProjectId.set(projectId);
	}

	// Handle task interactions
	async function handleTaskToggle(id: string) {
		try {
			await toggleTaskComplete(id);
		} catch (error) {
			console.error('Failed to toggle task:', error);
		}
	}

	async function handleTaskStar(id: string) {
		try {
			await toggleTaskStar(id);
		} catch (error) {
			console.error('Failed to star task:', error);
		}
	}

	function handleTaskClick(task: Task) {
		// TODO: Open task details modal
		console.log('Task clicked:', task.title);
	}

	function handleTagClick(tag: string) {
		selectedTags.update(tags => {
			if (tags.includes(tag)) {
				return tags.filter(t => t !== tag);
			} else {
				return [...tags, tag];
			}
		});
	}

	// Handle new task creation
	function handleNewTask() {
		showNewTaskDialog = true;
	}

	// Handle modal close
	function handleModalClose() {
		showNewTaskDialog = false;
	}

	// Handle cleanup action
	function handleCleanup() {
		// TODO: Implement cleanup functionality
		console.log('Cleanup triggered');
	}

	// Handle refresh action
	function handleRefresh() {
		// TODO: Implement refresh functionality
		console.log('Refresh triggered');
	}

	// Get current workspace name
	const currentWorkspaceName = $derived($workspaces.find(w => w.isActive)?.name || 'Personal');
</script>

<div class="h-full flex dark">
	<!-- Sidebar -->
	<Sidebar
		currentView={$currentView}
		currentProjectId={$currentProjectId}
		projects={$projects}
		onViewChange={handleViewChange}
		onProjectSelect={handleProjectSelect}
		focusTaskCount={$focusTaskCount}
		inboxTaskCount={$inboxTaskCount}
		nextTaskCount={$nextTaskCount}
		allTags={$allTags}
		searchQuery={$searchQuery}
		onSearchChange={handleSearchChange}
		onNewTask={handleNewTask}
	/>

	<!-- Main Content Area -->
	<div class="flex-1 overflow-hidden">
		<!-- Task List -->
		<TaskList
			tasks={$filteredTasks}
			projects={$projects}
			currentView={$currentView}
			onTaskToggle={handleTaskToggle}
			onTaskStar={handleTaskStar}
			onTaskClick={handleTaskClick}
			onTagClick={handleTagClick}
			showCompleted={true}
			onCleanup={handleCleanup}
			onRefresh={handleRefresh}
		/>
	</div>
</div>

<!-- New Task Modal -->
<NewTaskDialog open={showNewTaskDialog} on:close={handleModalClose} />
