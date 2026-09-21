<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { medals, medalCategories } from '$lib/constants/medals';
	import { playClick } from '$lib/audio/audio';
	import MedalCard from '$lib/components/medals/MedalCard.svelte';

	let selectedCategory = $state<string>('all');

	let filteredMedals = $derived(
		selectedCategory === 'all' ? medals : medals.filter((m) => m.category === selectedCategory)
	);

	let earnedCount = $derived(medals.filter((m) => game.hasMedal(m.id)).length);
	let totalMedals = $derived(medals.length);

	function handleBack() {
		if (game.soundEnabled) playClick();
		goto('/map');
	}

	function handleCategoryChange(catId: string) {
		if (game.soundEnabled) playClick();
		selectedCategory = catId;
	}
</script>

<svelte:head>
	<title>Salón de la Fama - Star Fox 3</title>
</svelte:head>

<div class="relative flex min-h-dvh w-full flex-col overflow-hidden bg-[#0f0f2a]">
	<header
		class="relative z-20 flex w-full items-center justify-between px-6 py-4 max-md:px-4 max-md:py-3"
	>
		<button
			class="cursor-pointer rounded-xl border border-gray-600 bg-[#252540] px-4 py-2 text-xs text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
			onclick={handleBack}
		>
			← Mapa
		</button>

		<div class="text-center">
			<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">
				SALÓN DE LA FAMA
			</h1>
			<p class="mt-0.5 text-[0.65rem] text-gray-400 max-md:text-[0.55rem]">
				{earnedCount}/{totalMedals} medallas
			</p>
		</div>

		<div class="w-16"></div>
	</header>

	<div
		class="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center gap-6 px-6 py-6 max-md:px-4 max-md:py-4"
	>
		<!-- Barra de progreso -->
		<div class="w-full max-w-md">
			<div class="mb-2 flex justify-between text-[0.7rem] text-gray-400">
				<span>Progreso</span>
				<span>{Math.round((earnedCount / totalMedals) * 100)}%</span>
			</div>
			<div class="h-3 w-full overflow-hidden rounded-full bg-[#1E1E2F]">
				<div
					class="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
					style:width="{(earnedCount / totalMedals) * 100}%"
				></div>
			</div>
		</div>

		<!-- Filtros -->
		<div class="flex flex-wrap justify-center gap-3">
			<button
				class="cursor-pointer rounded-xl border-2 px-4 py-2 text-xs font-bold transition-all max-md:px-3 max-md:text-[0.65rem]
					{selectedCategory === 'all'
					? 'border-amber-400 bg-[#252540] text-amber-400'
					: 'border-gray-600 bg-[#1E1E2F] text-gray-300 hover:border-amber-400/50'}"
				onclick={() => handleCategoryChange('all')}
			>
				🏆 Todas
			</button>
			{#each medalCategories as cat (cat.id)}
				<button
					class="cursor-pointer rounded-xl border-2 px-4 py-2 text-xs font-bold transition-all max-md:px-3 max-md:text-[0.65rem]
						{selectedCategory === cat.id
						? 'border-amber-400 bg-[#252540] text-amber-400'
						: 'border-gray-600 bg-[#1E1E2F] text-gray-300 hover:border-amber-400/50'}"
					onclick={() => handleCategoryChange(cat.id)}
				>
					{cat.icon}
					{cat.label}
				</button>
			{/each}
		</div>

		<!-- Grid de medallas -->
		<div class="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each filteredMedals as medal (medal.id)}
				<MedalCard {medal} earned={game.hasMedal(medal.id)} />
			{/each}
		</div>
	</div>
</div>
