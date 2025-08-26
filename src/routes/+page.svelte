<script lang="ts">
	import {
		tasks,
		projects,
		workspaces,
		workspacePerspectives,
		currentView,
		currentPerspectiveId,
		currentProjectId,
		currentWorkspace,

		filteredTasks,

		toggleTaskComplete,

		addTask,
		addSampleWorkspaceTasks,
		resetToInitialState
	} from '$lib/stores/taskStore';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import TaskList from '$lib/components/TaskList.svelte';
import { workspaceProjects, workspacePerspectivesOrdered } from '$lib/stores/taskStore';
    import TaskDetailsDialog from '$lib/components/TaskDetailsDialog.svelte';
    import TaskInlineEditor from '$lib/components/TaskInlineEditor.svelte';
    import TaskEditorForm from '$lib/components/TaskEditorForm.svelte';
    import type { Task } from '$lib/types';

	// Modal state
    let showTaskDetailsDialog = $state(false);
	let selectedTask: Task | null = $state(null);
    let showCreateEditor = $state(false);
    let createEditorEl = $state<HTMLElement | null>(null);

    // Update URL based on current state
    function updateURL(view: import('$lib/types').ViewType, perspectiveId?: string, projectId?: string, workspaceId?: string) {
        const params = new URLSearchParams();
        params.set('workspace', workspaceId || $currentWorkspace);
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
        params.set('workspace', workspaceId || $currentWorkspace);
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

	// Handle view changes
	function handleViewChange(view: import('$lib/types').ViewType, perspectiveId?: string) {
		currentView.set(view);
		if (view === 'perspective' && perspectiveId) {
			currentPerspectiveId.set(perspectiveId);
			currentProjectId.set(undefined);
			updateURL(view, perspectiveId);
		} else if (view === 'all') {
			currentProjectId.set(undefined);
			updateURL(view);
		} else if (view === 'project-all') {
			currentProjectId.set(undefined);
			updateURL(view);
		} else if (view === 'project') {
			// Keep current project if switching to project view
			const projectId = $currentProjectId;
			if (projectId) {
				updateURL(view, undefined, projectId);
			}
		}
	}

	// Handle project selection
	function handleProjectSelect(projectId: string | undefined) {
		currentProjectId.set(projectId);
		if (projectId) {
			updateURL('project', undefined, projectId);
		}
	}

	// Handle workspace change
	function handleWorkspaceChange(workspaceId: string) {
		currentWorkspace.set(workspaceId);
		
		// If we're in project view, switch to first perspective since projects are workspace-specific
		if ($currentView === 'project' || $currentView === 'project-all') {
			const firstPerspective = $workspacePerspectivesOrdered[0];
			if (firstPerspective) {
				currentView.set('perspective');
				currentPerspectiveId.set(firstPerspective.id);
				currentProjectId.set(undefined);
				updateURL('perspective', firstPerspective.id, undefined, workspaceId);
			}
		} else if ($currentView === 'perspective') {
			// Keep current perspective if it exists in new workspace, otherwise use first
			const perspectiveExists = $workspacePerspectivesOrdered.some(p => p.id === $currentPerspectiveId);
			if (!perspectiveExists) {
				const firstPerspective = $workspacePerspectivesOrdered[0];
				if (firstPerspective) {
					currentPerspectiveId.set(firstPerspective.id);
					updateURL('perspective', firstPerspective.id, undefined, workspaceId);
				}
			} else {
				updateURL('perspective', $currentPerspectiveId, undefined, workspaceId);
			}
		} else {
			// Keep current view for 'all' view
			updateURL($currentView, undefined, undefined, workspaceId);
		}
	}

	// Initialize view from URL parameters
	onMount(() => {
		// Add sample tasks to Work and Hobby workspaces if they're empty
		addSampleWorkspaceTasks();
		
		const urlParams = $page.url.searchParams;
		const workspaceParam = urlParams.get('workspace');
		const view = urlParams.get('view') as import('$lib/types').ViewType;
		const perspective = urlParams.get('perspective');
		const project = urlParams.get('project');

		// Set workspace from URL if valid, otherwise keep current
		if (workspaceParam && $workspaces.some(w => w.id === workspaceParam)) {
			currentWorkspace.set(workspaceParam);
		}

		if (view && ['perspective', 'project', 'project-all', 'all'].includes(view)) {
			currentView.set(view);
			
			if (view === 'perspective') {
				// Validate perspective exists in current workspace
				if (perspective && $workspacePerspectivesOrdered.some(p => p.id === perspective)) {
					currentPerspectiveId.set(perspective);
				} else {
					// Use first perspective as fallback
					const firstPerspective = $workspacePerspectivesOrdered[0];
					if (firstPerspective) {
						currentPerspectiveId.set(firstPerspective.id);
						updateURL('perspective', firstPerspective.id);
					}
				}
			} else if (view === 'project' && project) {
				// Validate project exists in current workspace
				const projectExists = $workspaceProjects.some(p => p.id === project);
				if (projectExists) {
					currentProjectId.set(project);
				} else {
					// Project doesn't exist, default to first perspective
					const firstPerspective = $workspacePerspectivesOrdered[0];
					if (firstPerspective) {
						currentView.set('perspective');
						currentPerspectiveId.set(firstPerspective.id);
						currentProjectId.set(undefined);
						updateURL('perspective', firstPerspective.id);
					}
				}
			} else if (view === 'project-all' || view === 'all') {
				currentProjectId.set(undefined);
			}
		} else {
			// Invalid or missing view, default to first workspace perspective
			const firstPerspective = $workspacePerspectivesOrdered[0];
			if (firstPerspective) {
				currentView.set('perspective');
				currentPerspectiveId.set(firstPerspective.id);
				currentProjectId.set(undefined);
				updateURL('perspective', firstPerspective.id);
			}
		}

		// Always update URL to ensure workspace is included
		const finalView = $currentView;
		const finalPerspective = $currentPerspectiveId;
		const finalProject = $currentProjectId;
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

	// Handle refresh action
	function handleRefresh() {
		// Reset app to initial state (temporary dev feature)
		resetToInitialState();
		// Update URL to reflect reset state - use first workspace
		if (!$workspaces[0]?.id) {
			throw new Error('No workspaces defined. At least one workspace is required.');
		}
		const firstWorkspaceId = $workspaces[0].id;
		const firstPerspective = $workspacePerspectivesOrdered[0];
		if (firstPerspective) {
			currentView.set('perspective');
			currentPerspectiveId.set(firstPerspective.id);
			updateURL('perspective', firstPerspective.id, undefined, firstWorkspaceId);
		}
	}

    // Auto-scroll the create editor into view whenever it opens
    $effect(() => {
        if (showCreateEditor && createEditorEl) {
            createEditorEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    });

    // Close inline/create editors when navigating away from the current view
    $effect(() => {
        // React to currentView, currentPerspectiveId or currentProjectId changes
        const v = $currentView;
        const persp = $currentPerspectiveId;
        const p = $currentProjectId;
        // When these change, ensure creation editor is closed
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
                showCreateEditor = true;
				event.preventDefault();
				return;
			}
		}

		// Perspective navigation (1, 2, 3, 4...)
		const perspectiveKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
		const perspectiveIndex = perspectiveKeys.indexOf(event.key);
		if (perspectiveIndex !== -1) {
			const perspective = $workspacePerspectivesOrdered[perspectiveIndex];
			if (perspective) {
				handleViewChange('perspective', perspective.id);
				event.preventDefault();
			}
			return;
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
		currentView={$currentView}
		currentPerspectiveId={$currentPerspectiveId}
		currentProjectId={$currentProjectId}
		currentWorkspace={$currentWorkspace}
		workspaces={$workspaces}
		perspectives={$workspacePerspectives}
		projects={$workspaceProjects}
		onViewChange={handleViewChange}
		onProjectSelect={handleProjectSelect}
		onWorkspaceChange={handleWorkspaceChange}
	/>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Task List fills remaining space -->
        <TaskList
            tasks={$filteredTasks}
            projects={$workspaceProjects}
            currentView={$currentView}
            currentPerspectiveId={$currentPerspectiveId}
            currentProjectId={$currentProjectId}
            onTaskToggle={handleTaskToggle}

            onTaskClick={handleTaskClick}

            showCompleted={true}
            onNewTask={handleNewTask}
            onCleanup={handleCleanup}
            onRefresh={handleRefresh}
        />

        {#if showCreateEditor}
            <div class="border-t border-gray-200 dark:border-gray-700 px-6 py-4" bind:this={createEditorEl}>
                <section class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                    <TaskEditorForm
                        task={{
                            id: 'new',
                            title: '',
                            description: '',
                            completed: false,
                            // Inherit project/perspective from current context
                            projectId: (
                                $currentView === 'project' && $currentProjectId
                                ? $currentProjectId
                                : ($workspaceProjects[0]?.id || '')
                            ),
                            perspective: (
                                $currentView === 'perspective'
                                ? $currentPerspectiveId
                                : ($workspacePerspectivesOrdered[0]?.id || '')  // For all other views, use first perspective
                            ),
                            workspaceId: $currentWorkspace,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }}
                        projects={$workspaceProjects}
                        perspectives={$workspacePerspectivesOrdered}
                        save={async ({ title, description, projectId, perspective }) => {
                            await addTask({
                                title,
                                description,
                                projectId,
                                workspaceId: $currentWorkspace,
                                completed: false,
                                perspective: perspective || ($workspacePerspectivesOrdered[0]?.id ?? '')
                            });
                            // Close after successful create
                            handleCreateClose();
                        }}
                        on:close={handleCreateClose}
                    />
                </section>
            </div>
        {/if}
    </div>
</div>

    

<!-- Task Details Modal -->
<TaskDetailsDialog open={showTaskDetailsDialog} task={selectedTask} on:close={handleTaskDetailsClose} />
