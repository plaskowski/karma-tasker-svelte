<script lang="ts">
	import {
		workspaces,
		filteredTasks,
		toggleTaskComplete,
		addTask,
		updateTask,
		resetToInitialState
	} from '$lib/stores/taskStore';
	import { navigation } from '$lib/stores/navigationStore';
	import { workspaceContext, setCurrentWorkspace } from '$lib/stores/workspaceContext';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import TaskDetailsDialog from '$lib/components/TaskDetailsDialog.svelte';
	import TaskEditorForm from '$lib/components/TaskEditorForm.svelte';
	import { NavigationService } from '$lib/services/navigation';
	import { TaskService } from '$lib/services/tasks';
	import type { Task, ViewType } from '$lib/types';
	import type { PageData } from './$types';

	// Component receives data from +page.ts
	let { data }: { data: PageData } = $props();

	// UI state
	let showTaskDetailsDialog = $state(false);
	let selectedTask: Task | null = $state(null);
	let showCreateEditor = $state(false);
	let createEditorEl = $state<HTMLElement | null>(null);


	// Handle navigation changes
	function handleNavigate(view: ViewType, options?: { perspectiveId?: string; projectId?: string }) {
		if (view === 'perspective' && options?.perspectiveId) {
			navigation.setPerspectiveView(options.perspectiveId);
			NavigationService.updateURL(view, {
				perspectiveId: options.perspectiveId,
				workspaceId: $workspaceContext.getId()
			});
		} else if (view === 'all') {
			navigation.setAllView();
			NavigationService.updateURL(view, {
				workspaceId: $workspaceContext.getId()
			});
		} else if (view === 'project-all') {
			navigation.setProjectAllView();
			NavigationService.updateURL(view, {
				workspaceId: $workspaceContext.getId()
			});
		} else if (view === 'project' && options?.projectId) {
			navigation.setProjectView(options.projectId);
			NavigationService.updateURL('project', {
				projectId: options.projectId,
				workspaceId: $workspaceContext.getId()
			});
		}
	}

	// Handle workspace change
	function handleWorkspaceChange(workspaceId: string) {
		setCurrentWorkspace(workspaceId);
		
		// If we're in project view, switch to first perspective since projects are workspace-specific
		if ($navigation.currentView === 'project' || $navigation.currentView === 'project-all') {
			const firstPerspective = $workspaceContext.getDefaultPerspective();
			if (firstPerspective) {
				navigation.setPerspectiveView(firstPerspective.id);
				NavigationService.updateURL('perspective', {
					perspectiveId: firstPerspective.id,
					workspaceId: workspaceId
				});
			}
		} else if ($navigation.currentView === 'perspective') {
			// Keep current perspective if it exists in new workspace, otherwise use first
			const perspectiveExists = $navigation.currentPerspectiveId ? 
				$workspaceContext.hasPerspective($navigation.currentPerspectiveId) : false;
			if (!perspectiveExists) {
				const firstPerspective = $workspaceContext.getDefaultPerspective();
				if (firstPerspective) {
					navigation.setPerspectiveView(firstPerspective.id);
					NavigationService.updateURL('perspective', {
						perspectiveId: firstPerspective.id,
						workspaceId: workspaceId
					});
				}
			} else {
				NavigationService.updateURL('perspective', {
					perspectiveId: $navigation.currentPerspectiveId,
					workspaceId: workspaceId
				});
			}
		} else {
			// Keep current view for 'all' view
			NavigationService.updateURL($navigation.currentView, {
				workspaceId: workspaceId
			});
		}
	}

	// Initialize keyboard navigation on mount
	onMount(() => {
		// Ensure URL stays in sync with navigation state
		NavigationService.updateURLIfChanged(
			$page.url.searchParams,
			$navigation.currentView,
			{
				perspectiveId: $navigation.currentPerspectiveId,
				projectId: $navigation.currentProjectId,
				workspaceId: $workspaceContext.getId()
			}
		);

		// Add keyboard navigation
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
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
        showCreateEditor = true;
    }

	// Handle modal close
    function handleCreateClose() {
        showCreateEditor = false;
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
	
	// Create a new task object with defaults based on current context
	function createNewTaskWithDefaults(): Task {
		return TaskService.createNewTaskWithDefaults($workspaceContext, $navigation);
	}

	// Handle refresh action
	function handleRefresh() {
		// Reset app to initial state (temporary dev feature)
		resetToInitialState();
		// Update URL to reflect reset state - use first workspace
		if (!$workspaces[0]?.id) {
			throw new Error('No workspaces defined. At least one workspace is required.');
		}
		const firstWorkspaceId = $workspaces[0].id;
		const firstPerspective = $workspaceContext.getDefaultPerspective();
		if (firstPerspective) {
			navigation.setPerspectiveView(firstPerspective.id);
			NavigationService.updateURL('perspective', {
				perspectiveId: firstPerspective.id,
				workspaceId: firstWorkspaceId
			});
		}
	}

    // Auto-scroll the create editor into view whenever it opens
    $effect(() => {
        if (showCreateEditor && createEditorEl) {
            createEditorEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    });

    // Close inline/create editors when navigation changes
    $effect(() => {
        // React to any navigation changes
        $navigation;
        // Close the creation editor when navigating
        showCreateEditor = false;
    });

    // Keyboard navigation
    function handleKeydown(event: KeyboardEvent) {
        // Allow Escape to close the create editor even when focused in inputs
        if (event.key === 'Escape') {
            if (showCreateEditor) {
                showCreateEditor = false;
                event.preventDefault();
            }
            return;
        }

        // Don't interfere with typing in inputs for other shortcuts
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
            return;
        }

		// New task (Ctrl+N)
		if (event.ctrlKey || event.metaKey) {
            if (event.key === 'n' || event.key === 'N') {
                showCreateEditor = true;
				event.preventDefault();
				return;
			}
		}

        // New task (N key)
        if (event.key === 'n' || event.key === 'N') {
            showCreateEditor = true;
			event.preventDefault();
			return;
		}
	}


</script>

<div class="h-full flex dark">
	<!-- Sidebar -->
        <Sidebar
		navigation={$navigation}
		workspace={$workspaceContext}
		workspaces={$workspaces}
		onNavigate={handleNavigate}
		onWorkspaceChange={handleWorkspaceChange}
	/>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Task List fills remaining space -->
        <TaskList
            tasks={$filteredTasks}
            workspace={$workspaceContext}
            navigation={$navigation}
            onTaskToggle={handleTaskToggle}

            onTaskClick={handleTaskClick}
            onUpdateTask={async (id, updates) => {
                await updateTask(id, updates);
            }}

            showCompleted={true}
            onNewTask={handleNewTask}
            onCleanup={handleCleanup}
            onRefresh={handleRefresh}
        />

        {#if showCreateEditor}
            <div class="border-t border-gray-200 dark:border-gray-700 px-6 py-4" bind:this={createEditorEl}>
                <div 
                    class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
                    role="dialog"
                    aria-label="Create new task"
                    data-testid="task-editor-panel"
                >
                    <TaskEditorForm
                        task={createNewTaskWithDefaults()}
                        workspace={$workspaceContext}
                        save={async ({ title, description, projectId, perspective }) => {
                            // Ensure projectId and perspective are always set
                            if (!projectId || !perspective) {
                                throw new Error('Project and perspective are required for task creation');
                            }
                            const taskData = TaskService.prepareTaskForCreation(
                                { title, description, projectId, perspective },
                                $workspaceContext.getId()
                            );
                            await addTask(taskData);
                            // Close after successful create
                            handleCreateClose();
                        }}
                        on:close={handleCreateClose}
                    />
                </div>
            </div>
        {/if}
    </div>
</div>

    

<!-- Task Details Modal -->
<TaskDetailsDialog 
	open={showTaskDetailsDialog} 
	task={selectedTask} 
	workspace={$workspaceContext}
	onUpdateTask={async (id, updates) => {
		await updateTask(id, updates);
	}}
	on:close={handleTaskDetailsClose} 
/>
