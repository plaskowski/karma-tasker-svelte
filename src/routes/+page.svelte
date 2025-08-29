<script lang="ts">
	import { DataService } from '$lib/services/dataService';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import TaskDetailsDialog from '$lib/components/TaskDetailsDialog.svelte';
	import TaskEditorForm from '$lib/components/TaskEditorForm.svelte';
	import { NavigationService } from '$lib/services/navigation';
	import { TaskService } from '$lib/services/tasks';
	import { 
		handleNavigate as handleNavigateService,
		handleWorkspaceChange as handleWorkspaceChangeService,
		handleKeyboardShortcut
	} from '$lib/services/pageHandlers';
	import type { Task, ViewType } from '$lib/types';
	import type { PageData } from './$types';

	// Component receives data from +page.ts
	let { data }: { data: PageData } = $props();
	
	// Reactive references to loaded data
	let workspaceContext = $derived(data.workspaceContext);
	let currentTasks = $derived(data.tasks);
	let allWorkspaces = $derived(data.workspaces);
	let currentNavigation = $derived(data.navigation);

	// UI state
	let showTaskDetailsDialog = $state(false);
	let selectedTask: Task | null = $state(null);
	let showCreateEditor = $state(false);
	let createEditorEl = $state<HTMLElement | null>(null);


	// Handle navigation changes
	function handleNavigate(view: ViewType, options?: { perspectiveId?: string; projectId?: string }) {
		handleNavigateService(view, workspaceContext, options);
	}

	// Handle workspace change
	function handleWorkspaceChange(workspaceId: string) {
		// Just update the URL, which will trigger a reload with new workspace
		handleWorkspaceChangeService(workspaceId, workspaceContext, currentNavigation);
	}

	// Initialize keyboard navigation on mount
	onMount(() => {
		// Ensure URL stays in sync with navigation state
		NavigationService.updateURLIfChanged(
			$page.url.searchParams,
			currentNavigation.currentView,
			{
				perspectiveId: currentNavigation.currentPerspectiveId,
				projectId: currentNavigation.currentProjectId,
				workspaceId: workspaceContext.getId()
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
			await DataService.toggleTaskComplete(id);
			// Reload data after task update
			await invalidateAll();
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
		return TaskService.createNewTaskWithDefaults(workspaceContext, currentNavigation);
	}

	// Handle refresh action
	async function handleRefresh() {
		await DataService.resetToDefaults();
		// Reload data after refresh
		await invalidateAll();
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
        currentNavigation;
        // Close the creation editor when navigating
        showCreateEditor = false;
    });

    // Keyboard navigation
    function handleKeydown(event: KeyboardEvent) {
        handleKeyboardShortcut(event, {
            onNewTask: () => { showCreateEditor = true; },
            onEscape: showCreateEditor ? () => { showCreateEditor = false; } : undefined
        });
    }


</script>

<div class="h-full flex dark">
	<!-- Sidebar -->
        <Sidebar
		navigation={currentNavigation}
		workspace={workspaceContext}
		workspaces={allWorkspaces}
		onNavigate={handleNavigate}
		onWorkspaceChange={handleWorkspaceChange}
	/>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Task List fills remaining space -->
        <TaskList
            tasks={currentTasks}
            workspace={workspaceContext}
            navigation={currentNavigation}
            onTaskToggle={handleTaskToggle}

            onTaskClick={handleTaskClick}
            onUpdateTask={async (id, updates) => {
                await DataService.updateTask(id, updates);
                await invalidateAll();
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
                        workspace={workspaceContext}
                        save={async ({ title, description, projectId, perspective }) => {
                            // Ensure projectId and perspective are always set
                            if (!projectId || !perspective) {
                                throw new Error('Project and perspective are required for task creation');
                            }
                            const taskData = TaskService.prepareTaskForCreation(
                                { title, description, projectId, perspective },
                                workspaceContext.getId()
                            );
                            await DataService.createTask(taskData);
                            // Reload data after task creation
                            await invalidateAll();
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
	workspace={workspaceContext}
	onUpdateTask={async (id, updates) => {
		await DataService.updateTask(id, updates);
		await invalidateAll();
	}}
	on:close={handleTaskDetailsClose} 
/>
