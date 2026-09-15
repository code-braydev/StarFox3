<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { shopItems, shopCategories } from '$lib/constants/shop';
	import { playClick } from '$lib/audio/audio';
	import ShopItemComponent from '$lib/components/shop/ShopItem.svelte';

	let selectedCategory = $state<string>('background');

	let filteredItems = $derived(shopItems.filter((item) => item.category === selectedCategory));

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
	<title>Tienda - Star Fox 3</title>
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
			<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">TIENDA</h1>
		</div>

		<div class="flex items-center gap-2">
			<span class="text-sm max-md:text-xs">💎</span>
			<span class="font-arcade text-xs text-[#FBBF24] max-md:text-[0.65rem]">
				{game.progress.gems}
			</span>
		</div>
	</header>

	<div
		class="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center gap-6 px-6 py-6 max-md:px-4 max-md:py-4"
	>
		<!-- Categorías -->
		<div class="flex flex-wrap justify-center gap-3">
			{#each shopCategories as cat (cat.id)}
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

		<!-- Grid de items -->
		<div class="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each filteredItems as item (item.id)}
				<ShopItemComponent {item} />
			{/each}
		</div>

		{#if filteredItems.length === 0}
			<p class="text-sm text-gray-500">No hay items en esta categoría.</p>
		{/if}
	</div>
</div>
