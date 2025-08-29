<!-- MIGRATION: This route component should be simplified:
     - Move all business logic to services
     - Extract URL management to a navigation service
     - Keep only view orchestration and event handling
     - Consider splitting into smaller sub-components
-->
<script lang="ts">
	import {
		tasks,
		projects,
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
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
    import TaskDetailsDialog from '$lib/components/TaskDetailsDialog.svelte';
    import TaskInlineEditor from '$lib/components/TaskInlineEditor.svelte';
    import TaskEditorForm from '$lib/components/TaskEditorForm.svelte';
    import type { Task } from '$lib/types';

	// Modal state
    let showTaskDetailsDialog = $state(false);
	let selectedTask: Task | null = $state(null);
    let showCreateEditor = $state(false);
    let createEditorEl = $state<HTMLElement | null>(null);

    // MIGRATION: URL management should move to lib/services/navigationService.ts
    // Update URL based on current state
    function updateURL(view: import('$lib/types').ViewType, perspectiveId?: string, projectId?: string, workspaceId?: string) {
        const params = new URLSearchParams();
        params.set('workspace', workspaceId || $workspaceContext.getId());
        params.set('view', view);
        if (perspectiveId && view === 'perspective') {
            params.set('perspective', perspectiveId);
        }
        if (projectId && view === 'project') {
            params.set('project', projectId);
        }
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
    }

    // Only update URL if it would change (avoid remount on initial load)
    function updateURLIfChanged(view: import('$lib/types').ViewType, perspectiveId?: string, projectId?: string, workspaceId?: string) {
        const params = new URLSearchParams();
        params.set('workspace', workspaceId || $workspaceContext.getId());
        params.set('view', view);
        if (perspectiveId && view === 'perspective') {
            params.set('perspective', perspectiveId);
        }
        if (projectId && view === 'project') {
            params.set('project', projectId);
        }
        const target = params.toString();
        const current = $page.url.searchParams.toString();
        if (target !== current) {
            goto(`?${target}`, { replaceState: true, noScroll: true });
        }
    }

	// Handle navigation changes
	function handleNavigate(view: import('$lib/types').ViewType, options?: { perspectiveId?: string; projectId?: string }) {
		if (view === 'perspective' && options?.perspectiveId) {
			navigation.setPerspectiveView(options.perspectiveId);
			updateURL(view, options.perspectiveId);
		} else if (view === 'all') {
			navigation.setAllView();
			updateURL(view);
		} else if (view === 'project-all') {
			navigation.setProjectAllView();
			updateURL(view);
		} else if (view === 'project' && options?.projectId) {
			navigation.setProjectView(options.projectId);
			updateURL('project', undefined, options.projectId);
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
				updateURL('perspective', firstPerspective.id, undefined, workspaceId);
			}
		} else if ($navigation.currentView === 'perspective') {
			// Keep current perspective if it exists in new workspace, otherwise use first
			const perspectiveExists = $navigation.currentPerspectiveId ? $workspaceContext.hasPerspective($navigation.currentPerspectiveId) : false;
			if (!perspectiveExists) {
				const firstPerspective = $workspaceContext.getDefaultPerspective();
				if (firstPerspective) {
					navigation.setPerspectiveView(firstPerspective.id);
					updateURL('perspective', firstPerspective.id, undefined, workspaceId);
				}
			} else {
				updateURL('perspective', $navigation.currentPerspectiveId, undefined, workspaceId);
			}
		} else {
			// Keep current view for 'all' view
			updateURL($navigation.currentView, undefined, undefined, workspaceId);
		}
	}

	// Initialize view from URL parameters
	onMount(() => {
		const urlParams = $page.url.searchParams;
		const workspaceParam = urlParams.get('workspace');
		const view = urlParams.get('view') as import('$lib/types').ViewType;
		const perspective = urlParams.get('perspective');
		const project = urlParams.get('project');

		// Set workspace from URL if valid, otherwise keep current
		if (workspaceParam && $workspaces.some(w => w.id === workspaceParam)) {
			setCurrentWorkspace(workspaceParam);
		}

		if (view && ['perspective', 'project', 'project-all', 'all'].includes(view)) {
			// View will be set based on specific conditions below
			
			if (view === 'perspective') {
				// Validate perspective exists in current workspace
				if (perspective && $workspaceContext.hasPerspective(perspective)) {
					navigation.setPerspectiveView(perspective);
				} else {
					// Use first perspective as fallback
					const firstPerspective = $workspaceContext.getDefaultPerspective();
					if (firstPerspective) {
						navigation.setPerspectiveView(firstPerspective.id);
						updateURL('perspective', firstPerspective.id);
					}
				}
			} else if (view === 'project' && project) {
				// Validate project exists in current workspace
				if ($workspaceContext.hasProject(project)) {
					navigation.setProjectView(project);
				} else {
					// Project doesn't exist, default to first perspective
					const firstPerspective = $workspaceContext.getDefaultPerspective();
					if (firstPerspective) {
						navigation.setPerspectiveView(firstPerspective.id);
						updateURL('perspective', firstPerspective.id);
					}
				}
			} else if (view === 'project-all') {
				navigation.setProjectAllView();
			} else if (view === 'all') {
				navigation.setAllView();
			}
		} else {
			// Invalid or missing view, default to first workspace perspective
			const firstPerspective = $workspaceContext.getDefaultPerspective();
			if (firstPerspective) {
				navigation.setPerspectiveView(firstPerspective.id);
				updateURL('perspective', firstPerspective.id);
			}
		}

		// Always update URL to ensure workspace is included
		const finalView = $navigation.currentView;
		const finalPerspective = $navigation.currentPerspectiveId;
		const finalProject = $navigation.currentProjectId;
		updateURLIfChanged(finalView, finalPerspective, finalProject);

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
	function createNewTaskWithDefaults() {
		return {
			id: 'new',
			title: '',
			description: '',
			completed: false,
			projectId: $workspaceContext.getEffectiveProjectId($navigation),
			perspective: $workspaceContext.getEffectivePerspectiveId($navigation),
			workspaceId: $workspaceContext.getId(),
			order: 0, // Will be calculated when task is actually saved
			createdAt: new Date(),
			updatedAt: new Date()
		};
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
			updateURL('perspective', firstPerspective.id, undefined, firstWorkspaceId);
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
                            await addTask({
                                title,
                                description,
                                projectId,
                                workspaceId: $workspaceContext.getId(),
                                completed: false,
                                perspective: perspective || ($workspaceContext.getDefaultPerspective()?.id ?? '')
                            });
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
