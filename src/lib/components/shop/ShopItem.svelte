<script lang="ts">
	import { onMount } from 'svelte';
	import { game } from '$lib/stores/game.svelte';
	import { getEffectiveShopPrice } from '$lib/stores/logic/passives';
	import { playClick, playGem } from '$lib/audio/audio';
	import type { ShopItem } from '$lib/constants/shop';

	let {
		item,
		onPurchase
	}: {
		item: ShopItem;
		onPurchase?: () => void;
	} = $props();

	const POTION_MAX = 5;
	const POTION_COOLDOWN_MS = 3 * 60 * 1000;

	let now = $state(Date.now());

	onMount(() => {
		if (item.category !== 'potion') return;
		const interval = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(interval);
	});

	let isPotion = $derived(item.category === 'potion');
	let potionPurchases = $derived(game.shop.potionPurchases ?? 0);
	let potionMaxReached = $derived(isPotion && potionPurchases >= POTION_MAX);
	let potionRemainingMs = $derived.by(() => {
		if (!isPotion) return 0;
		const lastAt = game.shop.lastPotionPurchasedAt ?? 0;
		if (!lastAt) return 0;
		return Math.max(0, POTION_COOLDOWN_MS - (now - lastAt));
	});
	let potionOnCooldown = $derived(isPotion && !potionMaxReached && potionRemainingMs > 0);

	function formatCooldown(ms: number): string {
		const totalSec = Math.ceil(ms / 1000);
		const m = Math.floor(totalSec / 60);
		const s = totalSec % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	let isPurchased = $derived(
		isPotion ? potionMaxReached : game.shop.purchased.includes(item.id)
	);
	let isEquipped = $derived(
		!isPotion &&
			game.shop.equipped[item.category as keyof typeof game.shop.equipped] === item.id
	);
	let effectivePrice = $derived(getEffectiveShopPrice(item.price, game.characters.selected));
	let hasDiscount = $derived(effectivePrice < item.price);
	let canAfford = $derived(game.progress.gems >= effectivePrice);

	let imgFailed = $state(false);

	const categoryEmoji: Record<string, string> = {
		background: '🌌',
		theme: '🎨',
		frame: '🖼️',
		accessory: '✨',
		potion: '🧪'
	};

	const themeSwatches: Record<string, { bg: string; card: string; accent: string }> = {
		'theme-safari': { bg: '#1e1913', card: '#33281d', accent: '#eab308' },
		'theme-ocean': { bg: '#0c1a2e', card: '#132d4c', accent: '#38bdf8' },
		'theme-neon': { bg: '#190a2a', card: '#2d124d', accent: '#f43f5e' },
		'theme-fire': { bg: '#220d0d', card: '#3b1616', accent: '#f97316' },
		'theme-forest': { bg: '#0d1e13', card: '#163522', accent: '#22c55e' }
	};

	function handleBuy() {
		if (!canAfford || isPurchased || potionOnCooldown) return;
		if (game.buyItem(item.id, item.price)) {
			if (game.soundEnabled) playGem();
			now = Date.now();
			onPurchase?.();
		}
	}

	function handleEquip() {
		if (!isPurchased || item.category === 'potion') return;
		if (game.soundEnabled) playClick();
		if (isEquipped) {
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
		? isEquipped
			? 'border-amber-400 bg-[#252540] shadow-[0_0_15px_rgba(251,191,36,0.3)]'
			: 'border-emerald-400/50 bg-[#252540]'
		: canAfford
			? 'border-gray-600 bg-[#1E1E2F] hover:border-amber-400/50'
			: 'border-gray-700 bg-[#1a1a2e] opacity-60'}"
>
	<!-- Preview / Icono del Item con Fallback -->
	{#if item.category === 'background'}
		<div
			class="relative h-24 w-full overflow-hidden rounded-xl border-2 bg-[#0f0f2a]"
			style="border-color: {item.uiPreview?.accent ?? '#fbbf24'}66;"
		>
			{#if !imgFailed}
				<img
					src={getAssetPath()}
					alt={item.name}
					class="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
					onerror={() => {
						imgFailed = true;
					}}
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center text-3xl">
					{categoryEmoji[item.category]}
				</div>
			{/if}
			{#if item.uiPreview}
				<div
					class="absolute right-1.5 bottom-1.5 left-1.5 flex items-center justify-between rounded-lg border px-2 py-1 text-[0.55rem] font-bold text-white shadow-md backdrop-blur-md"
					style="background-color: {item.uiPreview.bg}dd; border-color: {item.uiPreview.accent};"
				>
					<span class="truncate">{item.uiPreview.label}</span>
					<span
						class="h-2.5 w-2.5 flex-shrink-0 rounded-full"
						style="background-color: {item.uiPreview.accent}; box-shadow: 0 0 6px {item.uiPreview.accent};"
					></span>
				</div>
			{/if}
		</div>
	{:else}
		<div
			class="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-gray-700 bg-[#0f0f2a] p-1 text-2xl max-md:h-12 max-md:w-12"
		>
			{#if item.category === 'theme' && themeSwatches[item.id]}
				{@const swatch = themeSwatches[item.id]}
				<div
					class="flex h-full w-full flex-col justify-between rounded-xl p-1.5"
					style="background-color: {swatch.bg}; border: 2px solid {swatch.accent};"
				>
					<div class="h-2.5 w-full rounded-sm" style="background-color: {swatch.card};"></div>
					<div class="h-3 w-3 self-end rounded-full" style="background-color: {swatch.accent};"></div>
				</div>
			{:else if getAssetPath() && !imgFailed}
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
	{/if}

	<!-- Nombre -->
	<h3 class="text-center font-arcade text-xs text-white max-md:text-[0.65rem]">{item.name}</h3>

	<!-- Descripción -->
	<p
		class="line-clamp-2 text-center text-[0.7rem] leading-relaxed text-gray-400 max-md:text-[0.6rem]"
	>
		{item.description}
	</p>

	{#if isPotion}
		<span class="font-arcade text-[0.6rem] text-cyan-400">
			Usos: {potionPurchases}/{POTION_MAX}
		</span>
	{/if}

	<!-- Botón Comprar / Equipar -->
	{#if isPotion}
		{#if potionMaxReached}
			<span class="rounded-xl border border-gray-600 bg-gray-800/60 px-3 py-2 text-center font-arcade text-[0.6rem] text-gray-400 w-full">
				AGOTADO (5/5)
			</span>
		{:else if potionOnCooldown}
			<button
				disabled
				class="w-full cursor-not-allowed rounded-xl border border-amber-400/40 bg-amber-500/10 py-2 font-arcade text-[0.6rem] font-bold text-amber-300"
			>
				⏳ {formatCooldown(potionRemainingMs)}
			</button>
		{:else}
			<button
				class="w-full cursor-pointer rounded-xl border-none py-2 font-arcade text-[0.65rem] font-bold transition-all
					{canAfford
					? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#1E1E2F] hover:scale-102 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
					: 'cursor-not-allowed bg-gray-700 text-gray-400'}"
				disabled={!canAfford}
				onclick={handleBuy}
			>
				💎 {effectivePrice} ({POTION_MAX - potionPurchases} disp.)
				{#if hasDiscount}
					<span class="ml-1 text-[0.55rem] line-through opacity-70">{item.price}</span>
				{/if}
			</button>
		{/if}
	{:else if isPurchased}
		<button
			class="w-full cursor-pointer rounded-xl border-2 py-2 font-arcade text-[0.65rem] font-bold transition-all
				{isEquipped
				? 'border-amber-400 bg-amber-400/20 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
				: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'}"
			onclick={handleEquip}
		>
			{isEquipped ? '✓ EQUIPADO' : 'EQUIPAR'}
		</button>
	{:else}
		<button
			class="w-full cursor-pointer rounded-xl border-none py-2 font-arcade text-[0.65rem] font-bold transition-all
				{canAfford
				? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#1E1E2F] hover:scale-102 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
				: 'cursor-not-allowed bg-gray-700 text-gray-400'}"
			disabled={!canAfford}
			onclick={handleBuy}
		>
			💎 {effectivePrice}
			{#if hasDiscount}
				<span class="ml-1 text-[0.55rem] line-through opacity-70">{item.price}</span>
			{/if}
		</button>
	{/if}
</div>
