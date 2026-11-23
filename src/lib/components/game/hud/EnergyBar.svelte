<script lang="ts">
	import { game } from '$lib/stores/game.svelte';

	let energy = $derived(game.energy);
	let percentage = $derived(Math.round((energy.current / energy.max) * 100));

	let barColor = $derived(percentage > 50 ? '#22C55E' : percentage > 20 ? '#FBBF24' : '#EF4444');
</script>

<div class="flex items-center gap-2" title="Energía: {energy.current}/{energy.max}">
	<span class="text-xs max-md:text-[0.65rem]">⚡</span>
	<div class="relative h-2.5 w-24 overflow-hidden rounded-full bg-[#1E1E2F] max-md:h-2 max-md:w-16">
		<div
			class="h-full rounded-full transition-all duration-500"
			style:width="{percentage}%"
			style:background-color={barColor}
		></div>
	</div>
	<span class="text-[0.65rem] font-bold text-gray-300 max-md:text-[0.55rem]">
		{energy.current}/{energy.max}
	</span>
</div>
