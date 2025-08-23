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
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
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

	// Update URL based on current view/project
	function updateURL(view: import('$lib/types').ViewType, projectId?: string) {
		const params = new URLSearchParams();
		params.set('view', view);
		if (projectId && view === 'project') {
			params.set('project', projectId);
		}
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	// Handle view changes
	function handleViewChange(view: import('$lib/types').ViewType) {
		currentView.set(view);
		if (view !== 'project') {
			currentProjectId.set(undefined);
			updateURL(view);
		} else {
			// Keep current project if switching to project view
			const projectId = $currentProjectId;
			if (projectId) {
				updateURL(view, projectId);
			}
		}
	}

	// Handle project selection
	function handleProjectSelect(projectId: string) {
		currentProjectId.set(projectId);
		updateURL('project', projectId);
	}

	// Initialize view from URL parameters
	onMount(() => {
		const urlParams = $page.url.searchParams;
		const view = urlParams.get('view') as import('$lib/types').ViewType;
		const project = urlParams.get('project');

		if (view && ['focus', 'inbox', 'next', 'waiting', 'scheduled', 'someday', 'project'].includes(view)) {
			currentView.set(view);
			if (view === 'project' && project) {
				// Validate project exists
				const projectExists = $projects.some(p => p.id === project);
				if (projectExists) {
					currentProjectId.set(project);
				} else {
					// Project doesn't exist, default to focus
					currentView.set('focus');
					currentProjectId.set(undefined);
					updateURL('focus');
				}
			} else if (view !== 'project') {
				currentProjectId.set(undefined);
			}
		} else {
			// Invalid or missing view, default to focus
			currentView.set('focus');
			currentProjectId.set(undefined);
			updateURL('focus');
		}
	});

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
