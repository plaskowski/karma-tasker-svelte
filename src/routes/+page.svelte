<script lang="ts">
	import {
		tasks,
		projects,
		workspaces,
		workspaceProjects,
		workspacePerspectives,
		currentView,
		currentProjectId,
		currentWorkspace,
		searchQuery,

		filteredTasks,
		focusTaskCount,
		inboxTaskCount,

		toggleTaskComplete,
		toggleTaskStar,
		addTask,
		migrateToWorkspaces,
		addSampleWorkspaceTasks,
		resetToInitialState
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

	// Update URL based on current state
	function updateURL(view: import('$lib/types').ViewType, projectId?: string, workspaceId?: string) {
		const params = new URLSearchParams();
		params.set('workspace', workspaceId || $currentWorkspace);
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

	// Handle workspace change
	function handleWorkspaceChange(workspaceId: string) {
		currentWorkspace.set(workspaceId);
		
		// If we're in project view, switch to inbox since projects are workspace-specific
		if ($currentView === 'project') {
			currentView.set('inbox');
			currentProjectId.set(undefined);
			updateURL('inbox', undefined, workspaceId);
		} else {
			// Keep current view for perspective views (they exist in all workspaces)
			const currentViewValue = $currentView;
			currentProjectId.set(undefined);
			updateURL(currentViewValue, undefined, workspaceId);
		}
	}

	// Initialize view from URL parameters
	onMount(() => {
		// Run migration to ensure existing tasks/projects have workspaceId
		migrateToWorkspaces();
		
		// Add sample tasks to Work and Hobby workspaces if they're empty
		addSampleWorkspaceTasks();
		
		const urlParams = $page.url.searchParams;
		const workspaceParam = urlParams.get('workspace');
		const view = urlParams.get('view') as import('$lib/types').ViewType;
		const project = urlParams.get('project');

		// Set workspace from URL if valid, otherwise keep current
		if (workspaceParam && $workspaces.some(w => w.id === workspaceParam)) {
			currentWorkspace.set(workspaceParam);
		}

		if (view && ['focus', 'inbox', 'next', 'waiting', 'scheduled', 'someday', 'project'].includes(view)) {
			currentView.set(view);
			if (view === 'project' && project) {
				// Validate project exists in current workspace
				const projectExists = $workspaceProjects.some(p => p.id === project);
				if (projectExists) {
					currentProjectId.set(project);
				} else {
					// Project doesn't exist in current workspace, default to focus
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

		// Always update URL to ensure workspace is included
		const finalView = $currentView;
		const finalProject = $currentProjectId;
		updateURL(finalView, finalProject);
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
		// Reset app to initial state (temporary dev feature)
		resetToInitialState();
		// Update URL to reflect reset state
		updateURL('focus', undefined, 'personal');
	}


</script>

<div class="h-full flex dark">
	<!-- Sidebar -->
	<Sidebar
		currentView={$currentView}
		currentProjectId={$currentProjectId}
		currentWorkspace={$currentWorkspace}
		workspaces={$workspaces}
		perspectives={$workspacePerspectives}
		projects={$workspaceProjects}
		onViewChange={handleViewChange}
		onProjectSelect={handleProjectSelect}
		onWorkspaceChange={handleWorkspaceChange}
		focusTaskCount={$focusTaskCount}
		inboxTaskCount={$inboxTaskCount}

		searchQuery={$searchQuery}
		onSearchChange={handleSearchChange}
	/>

	<!-- Main Content Area -->
	<div class="flex-1 overflow-hidden">
		<!-- Task List -->
		<TaskList
			tasks={$filteredTasks}
			projects={$workspaceProjects}
			currentView={$currentView}
			currentProjectId={$currentProjectId}
			onTaskToggle={handleTaskToggle}
			onTaskStar={handleTaskStar}
			onTaskClick={handleTaskClick}

			showCompleted={true}
			onNewTask={handleNewTask}
			onCleanup={handleCleanup}
			onRefresh={handleRefresh}
		/>
	</div>
</div>

<!-- New Task Modal -->
<NewTaskDialog open={showNewTaskDialog} on:close={handleModalClose} />
