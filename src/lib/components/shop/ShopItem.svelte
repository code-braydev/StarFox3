<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';
	import type { ShopItem } from '$lib/constants/shop';

	let {
		item,
		onPurchase
	}: {
		item: ShopItem;
		onPurchase?: () => void;
	} = $props();

	let isPurchased = $derived(game.shop.purchased.includes(item.id));
	let isEquipped = $derived(() => {
		if (item.category === 'potion') return false;
		return game.shop.equipped[item.category as keyof typeof game.shop.equipped] === item.id;
	});
	let canAfford = $derived(game.progress.gems >= item.price);

	const categoryEmoji: Record<string, string> = {
		background: '🌌',
		theme: '🎨',
		frame: '🖼️',
		accessory: '✨',
		potion: '🧪'
	};

	function handleBuy() {
		if (!canAfford || isPurchased) return;
		if (game.soundEnabled) playClick();
		if (game.buyItem(item.id, item.price)) {
			if (item.category === 'potion') {
				game.addEnergy(50);
			}
			onPurchase?.();
		}
	}

	function handleEquip() {
		if (!isPurchased || item.category === 'potion') return;
		if (game.soundEnabled) playClick();
		if (isEquipped()) {
			game.equipItem(item.category as 'background' | 'theme' | 'frame' | 'accessory', null);
		} else {
			game.equipItem(item.category as 'background' | 'theme' | 'frame' | 'accessory', item.id);
		}
	}
</script>

<div
	class="flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300 max-md:p-3
		{isPurchased
		? isEquipped()
			? 'border-amber-400 bg-[#252540] shadow-[0_0_10px_rgba(251,191,36,0.2)]'
			: 'border-emerald-400/50 bg-[#252540]'
		: canAfford
			? 'border-gray-600 bg-[#1E1E2F] hover:border-amber-400/50'
			: 'border-gray-700 bg-[#1a1a2e] opacity-60'}"
>
	<!-- Icono -->
	<div
		class="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f0f2a] text-2xl max-md:h-10 max-md:w-10"
	>
		{categoryEmoji[item.category]}
	</div>

	<!-- Nombre -->
	<h3 class="text-center text-sm font-bold text-white max-md:text-xs">{item.name}</h3>

	<!-- Descripción -->
	<p class="text-center text-[0.65rem] text-gray-400 max-md:text-[0.55rem]">{item.description}</p>

	<!-- Botón -->
	{#if isPurchased}
		{#if item.category === 'potion'}
			<span class="text-[0.65rem] font-bold text-emerald-400">✅ Comprado</span>
		{:else}
			<button
				class="w-full cursor-pointer rounded-xl border-2 px-4 py-2 text-[0.7rem] font-bold transition-all
					{isEquipped()
					? 'border-amber-400 bg-amber-400/20 text-amber-400'
					: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'}"
				onclick={handleEquip}
			>
				{isEquipped() ? '✓ Equipado' : 'Equipar'}
			</button>
		{/if}
	{:else}
		<button
			class="w-full cursor-pointer rounded-xl border-none px-4 py-2 text-[0.7rem] font-bold transition-all
				{canAfford
				? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#1E1E2F] hover:scale-105'
				: 'cursor-not-allowed bg-gray-700 text-gray-400'}"
			disabled={!canAfford}
			onclick={handleBuy}
		>
			💎 {item.price}
		</button>
	{/if}
</div>
