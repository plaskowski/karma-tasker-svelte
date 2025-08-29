<script lang="ts">
	import { Plus, RefreshCw, Zap } from 'lucide-svelte';
	
	interface Props {
		title: string;
		onNewTask?: () => void;
		onCleanup?: () => void;
		onRefresh?: () => void;
	}
	
	let { title, onNewTask, onCleanup, onRefresh }: Props = $props();
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
					<span>Cleanup</span>
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