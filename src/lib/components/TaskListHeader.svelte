<script lang="ts">
	import { Plus, RefreshCw, Zap } from 'lucide-svelte';
	import type { NavigationState, WorkspaceData } from '$lib/types';
	import { findPerspective, findProject } from '$lib/helpers/workspaceHelpers';
	
	interface Props {
		navigation: NavigationState;
		workspace: WorkspaceData;
		onNewTask?: () => void;
		onCleanup?: () => void;
		onRefresh?: () => void;
	}
	
	let { navigation, workspace, onNewTask, onCleanup, onRefresh }: Props = $props();
	
	// Derive the title based on current navigation
	const title = $derived.by(() => {
		const currentProject = navigation.currentProjectId 
			? findProject(workspace, navigation.currentProjectId) 
			: undefined;
			
		const currentPerspective = navigation.currentPerspectiveId
			? findPerspective(workspace, navigation.currentPerspectiveId)
			: undefined;

		switch (navigation.currentView) {
			case 'all': return 'All';
			case 'project-all': return 'All Projects';
			case 'project': {
			if (!currentProject) {
				throw new Error('Current project not found');
			}
			return currentProject.name;
		}
			case 'perspective': {
			if (!currentPerspective) {
				throw new Error('Current perspective not found');
			}
			return currentPerspective.name;
		}
			default: return 'Tasks';
		}
	});
</script>

<div class="topbar">
	<div class="flex items-center justify-between w-full">
		<div>
			<h1 class="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h1>
		</div>
		
		<div class="flex items-center gap-2">
			{#if onNewTask}
				<button
					onclick={onNewTask}
					class="btn btn-base btn-outline"
					title="Create new task (N or Ctrl+N)"
				>
					<Plus class="w-4 h-4" />
					<span>New Item</span>
				</button>
			{/if}
			
			{#if onCleanup}
				<button
					onclick={onCleanup}
					class="btn btn-base btn-outline"
				>
					<Zap class="w-4 h-4" />
					<span>Clear</span>
				</button>
			{/if}
			
			{#if onRefresh}
				<button
					onclick={onRefresh}
					class="btn btn-base btn-outline"
				>
					<RefreshCw class="w-4 h-4" />
					<span>Refresh</span>
				</button>
			{/if}
		</div>
	</div>
</div>