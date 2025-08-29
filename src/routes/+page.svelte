<script lang="ts">
	import SidebarView from './SidebarView.svelte';
	import MainView from './MainView.svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
</script>

<div class="h-full flex dark">
	<SidebarView {data} />
	<MainView {data} />
</div>