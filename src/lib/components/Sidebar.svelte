<script lang="ts">
	import { Star, Inbox, Calendar, Clock, Users, Archive, Search, Settings } from 'lucide-svelte';
	import type { ViewType, Project } from '$lib/types';

	interface Props {
		currentView: ViewType;
		currentProjectId?: string;
		projects: Project[];
		onViewChange: (view: ViewType) => void;
		onProjectSelect: (projectId: string) => void;
		focusTaskCount: number;
		inboxTaskCount: number;
		nextTaskCount: number;

		searchQuery: string;
		onSearchChange: (query: string) => void;
	}

	let { 
		currentView, 
		currentProjectId, 
		projects, 
		onViewChange, 
		onProjectSelect, 
		focusTaskCount, 
		inboxTaskCount, 
		nextTaskCount,

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
			case 'next':
				return nextTaskCount;
			default:
				return 0;
		}
	}
</script>

<div class="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
	<!-- Header with branding -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center gap-2 mb-4">
			<span class="text-lg font-medium text-gray-900 dark:text-gray-100 tracking-wide">NIRVANA</span>
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
					<span class="text-sm text-current opacity-70">{getTaskCount(item.id as ViewType)}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Projects -->
	<div class="flex-1 p-4">
		<h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Projects</h3>
		<div class="space-y-1">
			{#each projects as project}
				<button
					onclick={() => {
						onViewChange('project');
						onProjectSelect(project.id);
					}}
					class="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors {currentView === 'project' && currentProjectId === project.id
						? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
						: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'}"
				>
					<div class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
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