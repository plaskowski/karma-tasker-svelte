<script lang="ts">
	import { Star, Inbox, Calendar, Clock, Users, Archive, Search, Settings, User, Gamepad2, Heart, Briefcase, Home, Activity, Building, ChevronDown } from 'lucide-svelte';
	import type { ViewType, Project, Workspace } from '$lib/types';

	interface Props {
		currentView: ViewType;
		currentProjectId?: string;
		currentWorkspace: string;
		workspaces: Workspace[];
		projects: Project[];
		onViewChange: (view: ViewType) => void;
		onProjectSelect: (projectId: string) => void;
		onWorkspaceChange: (workspaceId: string) => void;
		focusTaskCount: number;
		inboxTaskCount: number;

		searchQuery: string;
		onSearchChange: (query: string) => void;
	}

	let { 
		currentView, 
		currentProjectId,
		currentWorkspace,
		workspaces,
		projects, 
		onViewChange, 
		onProjectSelect,
		onWorkspaceChange,
		focusTaskCount, 
		inboxTaskCount,

		searchQuery,
		onSearchChange
	}: Props = $props();

	const sidebarItems = [
		{ id: 'inbox', label: 'Inbox', icon: Inbox },
		{ id: 'focus', label: 'Focus', icon: Star },
		{ id: 'next', label: 'Next', icon: Clock },
		{ id: 'waiting', label: 'Waiting', icon: Users },
		{ id: 'scheduled', label: 'Scheduled', icon: Calendar },
		{ id: 'someday', label: 'Someday', icon: Archive },
	];

	function getTaskCount(view: ViewType) {
		switch (view) {
			case 'focus':
				return focusTaskCount;
			case 'inbox':
				return inboxTaskCount;
			default:
				return null; // No counter for other views
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
				return Star;
			case 'electronics':
				return Settings;
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
	
	// Get current workspace name
	function getCurrentWorkspaceName() {
		return workspaces.find(w => w.id === currentWorkspace)?.name || 'Personal';
	}
</script>

<div class="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
	<!-- Header with branding -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center gap-2 mb-4">
			<span class="text-lg font-medium text-gray-900 dark:text-gray-100 tracking-wide">NIRVANA</span>
		</div>

		<!-- Workspace selector -->
		<div class="relative mb-3">
			<button
				onclick={() => isWorkspaceDropdownOpen = !isWorkspaceDropdownOpen}
				class="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/60 rounded text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
			>
				<div class="flex items-center gap-2">
					{#if currentWorkspace === 'personal'}
						<User class="w-4 h-4" />
					{:else if currentWorkspace === 'work'}
						<Briefcase class="w-4 h-4" />
					{:else if currentWorkspace === 'hobby'}
						<Gamepad2 class="w-4 h-4" />
					{:else}
						<User class="w-4 h-4" />
					{/if}
					<span>{getCurrentWorkspaceName()}</span>
				</div>
				<ChevronDown class="w-4 h-4 transition-transform {isWorkspaceDropdownOpen ? 'rotate-180' : ''}" />
			</button>
			
			{#if isWorkspaceDropdownOpen}
				<div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
					{#each workspaces as workspace}
						<button
							onclick={() => {
								onWorkspaceChange(workspace.id);
								isWorkspaceDropdownOpen = false;
							}}
							class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors {workspace.id === currentWorkspace ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}"
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
		
		<!-- Search bar -->
		<div class="relative mb-3">
			<Search class="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
			<input
				bind:value={searchQuery}
				oninput={(e) => onSearchChange(e.currentTarget.value)}
				placeholder="Search"
				class="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded focus:outline-none focus:border-blue-500"
			/>
		</div>
	</div>

	<!-- Views section -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Views</h3>
		<div class="space-y-1">
			{#each sidebarItems as item}
				<button
					onclick={() => onViewChange(item.id as ViewType)}
					class="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors {currentView === item.id 
						? (item.id === 'focus' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100')
						: (item.id === 'focus' ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100')}"
				>
					{#if item.icon === Inbox}
						<Inbox class="w-4 h-4" />
					{:else if item.icon === Star}
						<Star class="w-4 h-4" />
					{:else if item.icon === Clock}
						<Clock class="w-4 h-4" />
					{:else if item.icon === Users}
						<Users class="w-4 h-4" />
					{:else if item.icon === Calendar}
						<Calendar class="w-4 h-4" />
					{:else if item.icon === Archive}
						<Archive class="w-4 h-4" />
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
		<h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Projects</h3>
		<div class="space-y-1">
			{#each projects as project}
				{@const ProjectIcon = getProjectIcon(project.id)}
				<button
					onclick={() => {
						onViewChange('project');
						onProjectSelect(project.id);
					}}
					class="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors {currentView === 'project' && currentProjectId === project.id
						? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
						: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'}"
				>
					<ProjectIcon class="w-4 h-4" />
					<span class="flex-1 truncate">{project.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Bottom action buttons -->
	<div class="p-4 border-t border-gray-200 dark:border-gray-700">
		<button
			class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
		>
			<Settings class="w-4 h-4" />
			<span>Settings</span>
		</button>
	</div>
</div>