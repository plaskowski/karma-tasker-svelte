<script lang="ts">
	import { Star, Inbox, Calendar, Clock, Users, Archive } from 'lucide-svelte';
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
		allTags: string[];
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
		allTags 
	}: Props = $props();

	const sidebarItems = [
		{ id: 'inbox', label: 'Inbox', icon: Inbox },
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
	<!-- Focus section -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<button
			onclick={() => onViewChange('focus')}
			class="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors {currentView === 'focus' 
				? 'bg-blue-500 text-white' 
				: 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}"
		>
			<Star class="w-4 h-4" />
			<span class="flex-1">Focus</span>
			<span class="text-sm text-current opacity-70">{focusTaskCount}</span>
		</button>
	</div>

	<!-- Standard views -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="space-y-1">
			{#each sidebarItems as item}
				<button
					onclick={() => onViewChange(item.id as ViewType)}
					class="w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors {currentView === item.id 
						? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100' 
						: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'}"
				>
					{#if item.icon === Inbox}
						<Inbox class="w-4 h-4" />
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
		<h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Projects</h3>
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

	<!-- Tags section -->
	<div class="p-4 border-t border-gray-200 dark:border-gray-700">
		<h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Tags</h3>
		<div class="flex flex-wrap gap-1">
			{#each allTags.slice(0, 10) as tag}
				<span class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
					{tag}
				</span>
			{/each}
		</div>
	</div>
</div>