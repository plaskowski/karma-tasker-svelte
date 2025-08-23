<script lang="ts">
	import { Search, Plus, RefreshCw, Settings, Zap } from 'lucide-svelte';

	interface Props {
		workspaceName: string;
		searchQuery: string;
		onSearchChange: (query: string) => void;
		onNewTask: () => void;
	}

	let { workspaceName, searchQuery, onSearchChange, onNewTask }: Props = $props();
</script>

<div class="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
	<!-- Left section -->
	<div class="flex items-center gap-3">
		<div class="flex items-center gap-2">
			<span class="text-lg font-medium text-gray-900 dark:text-gray-100 tracking-wide">NIRVANA</span>
		</div>
		
		<button
			onclick={onNewTask}
			class="px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
		>
			<Plus class="w-3 h-3 mr-1" />
			New item
		</button>
	</div>

	<!-- Center section - Search -->
	<div class="flex-1 max-w-sm mx-6">
		<div class="relative">
			<Search class="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
			<input
				bind:value={searchQuery}
				oninput={(e) => onSearchChange(e.currentTarget.value)}
				placeholder="Search"
				class="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded focus:outline-none focus:border-blue-500"
			/>
		</div>
	</div>

	<!-- Right section -->
	<div class="flex items-center gap-1">
		<button
			class="px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
		>
			<Zap class="w-3 h-3 mr-1" />
			Cleanup 2
		</button>
		
		<button
			class="px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
		>
			<RefreshCw class="w-3 h-3 mr-1" />
			Refresh
		</button>
		
		<button
			class="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
		>
			<Settings class="w-3 h-3" />
		</button>
	</div>
</div>
