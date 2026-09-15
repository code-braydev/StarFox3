<script lang="ts">
	import { game } from '$lib/stores/game.svelte';

	let hearts = $derived(game.hearts);
</script>

<div class="flex items-center gap-1" title="Corazones: {hearts.current}/{hearts.max}">
	{#each Array(hearts.max) as _, i (i)}
		<span
			class="text-base transition-all duration-300 max-md:text-sm
				{i < hearts.current ? 'grayscale-0' : 'opacity-40 grayscale'}"
		>
			❤️
		</span>
	{/each}
</div>
