<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { initializeTestingFacade } from '$lib/testing/testingFacade';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Initialize testing facade for test environments
	onMount(() => {
		initializeTestingFacade();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-full">
	{@render children?.()}
</div>
