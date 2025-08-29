<script lang="ts">
	import { Zap, Inbox, Calendar, Clock, Users, Archive, User, Gamepad2, Heart, Briefcase, Home, Activity, Building, ChevronDown } from 'lucide-svelte';
	import type { ViewType, NavigationState, Workspace } from '$lib/types';
	import type { WorkspaceContext } from '$lib/models/WorkspaceContext';

	interface Props {
		navigation: NavigationState;
		workspace: WorkspaceContext;
		workspaces: Workspace[];
		onNavigate: (view: ViewType, options?: { perspectiveId?: string; projectId?: string }) => void;
		onWorkspaceChange: (workspaceId: string) => void;
	}

	let { 
		navigation,
		workspace,
		workspaces,
		onNavigate,
		onWorkspaceChange
	}: Props = $props();

	// Icon mapping for all icons (perspectives and projects)
	const iconMap: Record<string, any> = {
		inbox: Inbox,
		zap: Zap,
		clock: Clock,
		archive: Archive,
		users: Users,
		home: Home,
		building: Building,
		activity: Activity,
		user: User,
		briefcase: Briefcase,
		heart: Heart,
		calendar: Calendar,
		gamepad2: Gamepad2
	};

	function getIconComponent(iconName?: string) {
		if (!iconName) return Briefcase; // Default icon
		return iconMap[iconName.toLowerCase()] || Briefcase;
	}

    // Dynamic sidebar items: configured perspectives + All (last)
    const sidebarItems = $derived([
        ...workspace.getPerspectives()
            .map(p => ({
                id: p.id,
                label: p.name,
                icon: getIconComponent(p.icon)
            })),
        { id: 'all', label: 'All', icon: Clock }
    ]);

	function getProjectIcon(projectId: string) {
		const project = workspace.getProject(projectId);
		if (!project) return Briefcase; // Fallback if project not found
		return getIconComponent(project.icon); // icon is now required
	}

	function getWorkspaceIcon(workspaceId: string) {
		// Map workspace IDs to icons (for demo workspaces)
		const iconMap: Record<string, any> = {
			'personal': User,
			'work': Briefcase,
			'hobby': Gamepad2
		};
		return iconMap[workspaceId] || User; // Default to User icon
	}

	// State for workspace selector dropdown
	let isWorkspaceDropdownOpen = $state(false);
	let workspaceDropdownRef: HTMLDivElement;
	let workspaceDropdownContainerRef = $state<HTMLDivElement | null>(null);
	
	// Get current workspace name
	function getCurrentWorkspaceName() {
		return workspace.getName();
	}

	// Get dynamic header title based on current context
	function getHeaderTitle() {
		// Always show workspace context - projects are shown in TaskList header
		return getCurrentWorkspaceName();
	}

	// Close dropdown when clicking outside header and inline dropdown container
	function handleClickOutside(event: MouseEvent) {
		const targetNode = event.target as Node;
		const clickedInsideHeader = workspaceDropdownRef?.contains(targetNode);
		const clickedInsideInlineDropdown = workspaceDropdownContainerRef && workspaceDropdownContainerRef.contains(targetNode);
		if (!clickedInsideHeader && !clickedInsideInlineDropdown) {
			isWorkspaceDropdownOpen = false;
		}
	}

	// Add event listener for click outside
	$effect(() => {
		if (isWorkspaceDropdownOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div class="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
	<!-- Header with branding -->
    <div class="topbar" bind:this={workspaceDropdownRef}>
		<div class="flex items-center gap-3">
			<div class="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-sm">
				<span class="text-sm font-semibold text-white">N</span>
			</div>
			<button
				onclick={() => isWorkspaceDropdownOpen = !isWorkspaceDropdownOpen}
				class="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-gray-100 tracking-wide hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
				title="Switch workspace"
			>
				<span>{getHeaderTitle()}</span>
				<ChevronDown class="w-4 h-4 transition-transform {isWorkspaceDropdownOpen ? 'rotate-180' : ''}" />
			</button>
			

		</div>
	</div>

	{#if isWorkspaceDropdownOpen}
		<div class="py-0 border-b border-gray-200 dark:border-gray-700" bind:this={workspaceDropdownContainerRef}>
			<div class="rounded-none overflow-hidden">
				{#each workspaces as ws}
					{@const Icon = getWorkspaceIcon(ws.id)}
					<button
						onclick={() => {
							onWorkspaceChange(ws.id);
							isWorkspaceDropdownOpen = false;
						}}
						class="w-full btn btn-base text-base text-left rounded-none {ws.id === workspace.getId() ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
					>
						<Icon class="w-5 h-5" />
						<span>{ws.name}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

			<!-- Views section -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Views</h3>
		<div class="space-y-1">
            {#each sidebarItems as item}
				{@const Icon = item.icon}
				<button
					onclick={() => onNavigate(item.id === 'all' ? 'all' : 'perspective', item.id === 'all' ? undefined : { perspectiveId: item.id })}
					class="w-full btn btn-base text-left {(navigation.currentView === 'perspective' && navigation.currentPerspectiveId === item.id) || (navigation.currentView === 'all' && item.id === 'all')
					? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
						: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				>
					<Icon class="w-4 h-4" />
					<span class="flex-1">{item.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Projects -->
	<div class="flex-1 p-4">
		<h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Projects</h3>
		<div class="space-y-1">
			{#each workspace.getProjects() as project}
				{@const ProjectIcon = getProjectIcon(project.id)}
				<button
					onclick={() => onNavigate('project', { projectId: project.id })}
					class="w-full btn btn-base text-left {navigation.currentView === 'project' && navigation.currentProjectId === project.id
						? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
						: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				>
					<ProjectIcon class="w-4 h-4" />
					<span class="flex-1 truncate">{project.name}</span>
				</button>
			{/each}
			
			<!-- All Projects view -->
			<button
				onclick={() => onNavigate('project-all')}
				class="w-full btn btn-base text-left {navigation.currentView === 'project-all'
					? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
					: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
			>
				<Clock class="w-4 h-4" />
				<span class="flex-1">All</span>
			</button>
		</div>
	</div>
</div>