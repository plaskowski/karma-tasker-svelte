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

		filteredTasks,
		firstTaskCount,
		inboxTaskCount,

		toggleTaskComplete,

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
	import TaskDetailsDialog from '$lib/components/TaskDetailsDialog.svelte';
	import type { Task } from '$lib/types';

	// Modal state
	let showNewTaskDialog = $state(false);
	let showTaskDetailsDialog = $state(false);
	let selectedTask: Task | null = $state(null);

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

		if (view && ['first', 'inbox', 'next', 'waiting', 'scheduled', 'someday', 'project'].includes(view)) {
			currentView.set(view);
			if (view === 'project' && project) {
				// Validate project exists in current workspace
				const projectExists = $workspaceProjects.some(p => p.id === project);
				if (projectExists) {
					currentProjectId.set(project);
				} else {
					// Project doesn't exist in current workspace, default to first
					currentView.set('first');
					currentProjectId.set(undefined);
					updateURL('first');
				}
			} else if (view !== 'project') {
				currentProjectId.set(undefined);
			}
		} else {
			// Invalid or missing view, default to first
			currentView.set('first');
			currentProjectId.set(undefined);
			updateURL('first');
		}

		// Always update URL to ensure workspace is included
		const finalView = $currentView;
		const finalProject = $currentProjectId;
		updateURL(finalView, finalProject);

		// Add keyboard navigation
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	// Handle task interactions
	async function handleTaskToggle(id: string) {
		try {
			await toggleTaskComplete(id);
		} catch (error) {
			console.error('Failed to toggle task:', error);
		}
	}



	function handleTaskClick(task: Task) {
		selectedTask = task;
		showTaskDetailsDialog = true;
	}



	// Handle new task creation
	function handleNewTask() {
		showNewTaskDialog = true;
	}

	// Handle modal close
	function handleModalClose() {
		showNewTaskDialog = false;
	}

	function handleTaskDetailsClose() {
		showTaskDetailsDialog = false;
		selectedTask = null;
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
		updateURL('first', undefined, 'personal');
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		// Don't interfere with typing in inputs
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
			return;
		}

		// Close modal on Escape
		if (event.key === 'Escape') {
			if (showNewTaskDialog) {
				showNewTaskDialog = false;
				event.preventDefault();
			}
			return;
		}

		// Workspace navigation (Ctrl+1, Ctrl+2, Ctrl+3)
		if (event.ctrlKey || event.metaKey) {
			const workspaceKeys = ['1', '2', '3'];
			const keyIndex = workspaceKeys.indexOf(event.key);
			if (keyIndex !== -1) {
				const workspace = $workspaces[keyIndex];
				if (workspace) {
					handleWorkspaceChange(workspace.id);
					event.preventDefault();
				}
				return;
			}

			// New task (Ctrl+N)
			if (event.key === 'n' || event.key === 'N') {
				showNewTaskDialog = true;
				event.preventDefault();
				return;
			}
		}

		// Perspective navigation (1, 2, 3, 4...)
		const perspectiveKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
		const perspectiveIndex = perspectiveKeys.indexOf(event.key);
		if (perspectiveIndex !== -1) {
			// First key is for 'first' perspective
			if (perspectiveIndex === 0) {
				handleViewChange('first');
				event.preventDefault();
				return;
			}
			
			// Other keys map to workspace perspectives
			const perspective = $workspacePerspectives[perspectiveIndex - 1];
			if (perspective) {
				handleViewChange(perspective.id);
				event.preventDefault();
			}
			return;
		}

		// New task (N key)
		if (event.key === 'n' || event.key === 'N') {
			showNewTaskDialog = true;
			event.preventDefault();
			return;
		}
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
		firstTaskCount={$firstTaskCount}
		inboxTaskCount={$inboxTaskCount}
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

<!-- Task Details Modal -->
<TaskDetailsDialog open={showTaskDetailsDialog} task={selectedTask} on:close={handleTaskDetailsClose} />
