<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { characters } from '$lib/constants/characters';
	import { playClick } from '$lib/audio/audio';

	let {
		onUse
	}: {
		onUse: () => void;
	} = $props();

	let selectedChar = $derived(characters.find((c) => c.id === game.characters.selected));

	let canUse = $derived(() => {
		if (!selectedChar) return false;
		return game.canUseActive(selectedChar.id);
	});

	let cooldownText = $derived(() => {
		if (!selectedChar) return '';
		if (selectedChar.active.cooldownType === 'level') return '1× por nivel';
		const lastUsed = game.characters.cooldowns[selectedChar.id] ?? 0;
		const cooldownMs = (selectedChar.active.cooldownMinutes ?? 0) * 60 * 1000;
		const remaining = cooldownMs - (Date.now() - lastUsed);
		if (remaining <= 0) return 'Listo';
		const mins = Math.ceil(remaining / 60000);
		return `${mins} min`;
	});

	function handleUse() {
		if (!canUse() || !selectedChar) return;
		if (game.soundEnabled) playClick();
		game.useActive(selectedChar.id);
		onUse();
	}
</script>

{#if selectedChar && selectedChar.active}
	<button
		class="group flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all duration-300 max-md:px-3 max-md:py-2
			{canUse()
			? 'border-amber-400/50 bg-[#252540] hover:border-amber-400 hover:bg-[#2a2a50] hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]'
			: 'cursor-not-allowed border-gray-700 bg-[#1a1a2e] opacity-50'}"
		disabled={!canUse()}
		onclick={handleUse}
	>
		<span class="text-xl max-md:text-lg">⚡</span>
		<div class="text-left">
			<div class="text-xs font-bold text-white max-md:text-[0.7rem]">
				{selectedChar.active.name}
			</div>
			<div class="text-[0.6rem] text-gray-400 max-md:text-[0.5rem]">
				{canUse() ? '¡Usar!' : cooldownText()}
			</div>
		</div>
	</button>
{/if}
