<script lang="ts">
	import { Zap, Inbox, Calendar, Clock, Users, Archive, User, Gamepad2, Heart, Briefcase, Home, Activity, Building, ChevronDown } from 'lucide-svelte';
	import type { ViewType, Project, Workspace, PerspectiveConfig } from '$lib/types';

	interface Props {
		currentView: ViewType;
		currentProjectId?: string;
		currentWorkspace: string;
		workspaces: Workspace[];
		perspectives: PerspectiveConfig[];
		projects: Project[];
		onViewChange: (view: ViewType) => void;
		onProjectSelect: (projectId: string) => void;
		onWorkspaceChange: (workspaceId: string) => void;
		firstTaskCount: number;
		inboxTaskCount: number;
	}

	let { 
		currentView, 
		currentProjectId,
		currentWorkspace,
		workspaces,
		perspectives,
		projects, 
		onViewChange, 
		onProjectSelect,
		onWorkspaceChange,
		firstTaskCount, 
		inboxTaskCount
	}: Props = $props();

	// Icon mapping for perspectives
	const iconMap: Record<string, any> = {
		inbox: Inbox,
		zap: Zap,
		clock: Clock,
		archive: Archive,
		users: Users,
	};

	// Dynamic sidebar items: First + configured perspectives
	const sidebarItems = $derived([
		{ id: 'first', label: 'First', icon: Zap },
		...perspectives.map(p => ({
			id: p.id,
			label: p.name,
			icon: iconMap[p.icon] || Clock
		}))
	]);

	function getTaskCount(view: ViewType) {
		switch (view) {
			case 'first':
				return firstTaskCount;
			case 'inbox':
				return inboxTaskCount;
			default:
				return null; // No counter for other perspectives yet
		}
	}

	function getProjectIcon(projectId: string) {
		switch (projectId) {
			case 'household':
				return Home;
			case 'finances':
				return Building;
			case 'health':
				return Activity;
			case 'travel':
				return Calendar;
			case 'learning':
				return User;
			case 'work-projects':
				return Briefcase;
			case 'meetings':
				return Users;
			case 'photography':
				return Heart;
			case 'electronics':
				return Activity;
			case 'music':
				return Heart;
			default:
				return Briefcase; // Default fallback icon
		}
	}

	function getWorkspaceIcon(workspaceId: string) {
		switch (workspaceId) {
			case 'personal':
				return User;
			case 'work':
				return Briefcase;
			case 'hobby':
				return Gamepad2;
			default:
				return User;
		}
	}

	// State for workspace selector dropdown
	let isWorkspaceDropdownOpen = $state(false);
	let workspaceDropdownRef: HTMLDivElement;
	
	// Get current workspace name
	function getCurrentWorkspaceName() {
		return workspaces.find(w => w.id === currentWorkspace)?.name || 'Personal';
	}

	// Get dynamic header title based on current context
	function getHeaderTitle() {
		// Always show workspace context - projects are shown in TaskList header
		return getCurrentWorkspaceName();
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (workspaceDropdownRef && !workspaceDropdownRef.contains(event.target as Node)) {
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

<div class="w-64 bg-surface-50 border-r border-surface-200 flex flex-col h-full">
	<!-- Header with branding -->
	<div class="p-4 border-b border-surface-200">
		<div class="flex items-center gap-3 mb-4 relative" bind:this={workspaceDropdownRef}>
			<div class="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-sm">
				<span class="text-sm font-semibold text-white">N</span>
			</div>
			<button
				onclick={() => isWorkspaceDropdownOpen = !isWorkspaceDropdownOpen}
				class="flex items-center gap-2 text-lg font-medium text-surface-900 tracking-wide hover:text-surface-600 transition-colors"
				title="Switch workspace (Ctrl+1,2,3)"
			>
				<span>{getHeaderTitle()}</span>
				<ChevronDown class="w-4 h-4 transition-transform {isWorkspaceDropdownOpen ? 'rotate-180' : ''}" />
			</button>
			
			{#if isWorkspaceDropdownOpen}
				<div class="absolute top-full left-0 right-0 mt-2 bg-surface-50 border border-surface-200 rounded-lg shadow-xl z-50 overflow-hidden">
					{#each workspaces as workspace}
						<button
							onclick={() => {
								onWorkspaceChange(workspace.id);
								isWorkspaceDropdownOpen = false;
							}}
							class="w-full btn btn-sm text-left rounded-none {workspace.id === currentWorkspace ? 'bg-primary-100 text-primary-700' : 'bg-transparent text-surface-700 hover:bg-surface-100'}"
						>
							{#if workspace.id === 'personal'}
								<User class="w-4 h-4" />
							{:else if workspace.id === 'work'}
								<Briefcase class="w-4 h-4" />
							{:else if workspace.id === 'hobby'}
								<Gamepad2 class="w-4 h-4" />
							{:else}
								<User class="w-4 h-4" />
							{/if}
							<span>{workspace.name}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

			<!-- Views section -->
	<div class="p-4 border-b border-surface-200">
		<h3 class="text-xs font-medium text-surface-500 mb-2 uppercase tracking-wide">
			Views 
			<span class="text-surface-400 normal-case font-normal">(1-9)</span>
		</h3>
		<div class="space-y-1">
			{#each sidebarItems as item}
				<button
					onclick={() => onViewChange(item.id as ViewType)}
					class="w-full btn btn-base text-left {currentView === item.id 
						? (item.id === 'first' ? 'bg-primary-500 text-white' : 'bg-surface-200 text-surface-900')
						: 'bg-transparent text-surface-600 hover:bg-surface-100'}"
				>
					{#if item.icon === Zap}
						<Zap class="w-4 h-4" />
					{:else if item.icon === Inbox}
						<Inbox class="w-4 h-4" />
					{:else if item.icon === Clock}
						<Clock class="w-4 h-4" />
					{:else if item.icon === Archive}
						<Archive class="w-4 h-4" />
					{:else if item.icon === Users}
						<Users class="w-4 h-4" />
					{:else}
						<Clock class="w-4 h-4" />
					{/if}
					<span class="flex-1">{item.label}</span>
					{#if getTaskCount(item.id as ViewType) !== null}
						<span class="text-sm text-current opacity-70">{getTaskCount(item.id as ViewType)}</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Projects -->
	<div class="flex-1 p-4">
		<h3 class="text-xs font-medium text-surface-500 mb-2 uppercase tracking-wide">Projects</h3>
		<div class="space-y-1">
			{#each projects as project}
				{@const ProjectIcon = getProjectIcon(project.id)}
				<button
					onclick={() => {
						onViewChange('project');
						onProjectSelect(project.id);
					}}
					class="w-full btn btn-base text-left {currentView === 'project' && currentProjectId === project.id
						? 'bg-surface-200 text-surface-900'
						: 'bg-transparent text-surface-600 hover:bg-surface-100'}"
				>
					<ProjectIcon class="w-4 h-4" />
					<span class="flex-1 truncate">{project.name}</span>
				</button>
			{/each}
		</div>
	</div>
</div>