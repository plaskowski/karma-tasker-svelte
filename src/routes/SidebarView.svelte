<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { ViewType } from '$lib/types';
	import type { PageData } from './$types';
    import {handleNavigate, handleWorkspaceChange} from "$lib/services/pageHandlers";
	
	let { data }: { data: PageData } = $props();
	
	let workspaceContext = $derived(data.workspaceContext);
	let allWorkspaces = $derived(data.workspaces);
	let currentNavigation = $derived(data.navigation);
	
	function handleNavigateInWorkspace(view: ViewType, options?: { perspectiveId?: string; projectId?: string }) {
		handleNavigate(view, workspaceContext, options);
	}
	
	function handleWorkspaceChangeFromWorkspace(workspaceId: string) {
		handleWorkspaceChange(workspaceId, workspaceContext, currentNavigation);
	}
</script>

<Sidebar
	navigation={currentNavigation}
	workspace={workspaceContext}
	workspaces={allWorkspaces}
	onNavigate={handleNavigateInWorkspace}
	onWorkspaceChange={handleWorkspaceChangeFromWorkspace}
/>