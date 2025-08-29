<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { 
		handleNavigate as handleNavigateService,
		handleWorkspaceChange as handleWorkspaceChangeService
	} from '$lib/services/pageHandlers';
	import type { ViewType } from '$lib/types';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let workspaceContext = $derived(data.workspaceContext);
	let allWorkspaces = $derived(data.workspaces);
	let currentNavigation = $derived(data.navigation);
	
	function handleNavigate(view: ViewType, options?: { perspectiveId?: string; projectId?: string }) {
		handleNavigateService(view, workspaceContext, options);
	}
	
	function handleWorkspaceChange(workspaceId: string) {
		handleWorkspaceChangeService(workspaceId, workspaceContext, currentNavigation);
	}
</script>

<Sidebar
	navigation={currentNavigation}
	workspace={workspaceContext}
	workspaces={allWorkspaces}
	onNavigate={handleNavigate}
	onWorkspaceChange={handleWorkspaceChange}
/>