<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { playClick, playGem } from '$lib/audio/audio';
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

	let imgFailed = $state(false);

	const categoryEmoji: Record<string, string> = {
		background: '🌌',
		theme: '🎨',
		frame: '🖼️',
		accessory: '✨',
		potion: '🧪'
	};

	function handleBuy() {
		if (!canAfford || isPurchased) return;
		if (game.buyItem(item.id, item.price)) {
			if (game.soundEnabled) playGem();
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

	function getAssetPath(): string {
		if (item.category === 'background') return `/img/background/${item.id}.webp`;
		if (item.category === 'frame') return `/img/frames/${item.id}.png`;
		if (item.category === 'accessory') return `/img/accessories/${item.id}.png`;
		return '';
	}
</script>

<div
	class="flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300 max-md:p-3
		{isPurchased
		? isEquipped()
			? 'border-amber-400 bg-[#252540] shadow-[0_0_15px_rgba(251,191,36,0.3)]'
			: 'border-emerald-400/50 bg-[#252540]'
		: canAfford
			? 'border-gray-600 bg-[#1E1E2F] hover:border-amber-400/50'
			: 'border-gray-700 bg-[#1a1a2e] opacity-60'}"
>
	<!-- Preview / Icono del Item con Fallback -->
	<div
		class="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f0f2a] p-1 text-2xl overflow-hidden border border-gray-700 max-md:h-12 max-md:w-12"
	>
		<!-- RECURSO: {getAssetPath()} (Si agregas el archivo se cargará automáticamente aquí) -->
		{#if getAssetPath() && !imgFailed}
			<img
				src={getAssetPath()}
				alt={item.name}
				class="h-full w-full object-contain"
				onerror={() => {
					imgFailed = true;
				}}
			/>
		{:else}
			<span>{categoryEmoji[item.category]}</span>
		{/if}
	</div>

	<!-- Nombre -->
	<h3 class="text-center font-arcade text-xs text-white max-md:text-[0.65rem]">{item.name}</h3>

	<!-- Descripción -->
	<p class="text-center text-[0.7rem] text-gray-400 max-md:text-[0.6rem] leading-relaxed line-clamp-2">
		{item.description}
	</p>

	<!-- Botón Comprar / Equipar -->
	{#if isPurchased}
		{#if item.category === 'potion'}
			<span class="text-[0.7rem] font-bold text-emerald-400">✅ Aplicado</span>
		{:else}
			<button
				class="w-full cursor-pointer rounded-xl border-2 py-2 font-arcade text-[0.65rem] font-bold transition-all
					{isEquipped()
					? 'border-amber-400 bg-amber-400/20 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
					: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'}"
				onclick={handleEquip}
			>
				{isEquipped() ? '✓ EQUIPADO' : 'EQUIPAR'}
			</button>
		{/if}
	{:else}
		<button
			class="w-full cursor-pointer rounded-xl border-none py-2 font-arcade text-[0.65rem] font-bold transition-all
				{canAfford
				? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#1E1E2F] hover:scale-102 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
				: 'cursor-not-allowed bg-gray-700 text-gray-400'}"
			disabled={!canAfford}
			onclick={handleBuy}
		>
			💎 {item.price}
		</button>
	{/if}
</div>
