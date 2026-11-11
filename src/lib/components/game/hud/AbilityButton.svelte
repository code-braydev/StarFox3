<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { characters, getCharacterHead } from '$lib/constants/characters';
	import { handleAvatarError } from '$lib/constants/assets';
	import { playClick } from '$lib/audio/audio';

	let {
		onUse
	}: {
		onUse: () => void;
	} = $props();

	let selectedChar = $derived(characters.find((c) => c.id === game.characters.selected));

	let canUse = $derived(selectedChar ? game.canUseActive(selectedChar.id) : false);

	function handleUse() {
		if (!canUse || !selectedChar) return;
		if (game.soundEnabled) playClick();
		game.useActive(selectedChar.id);
		onUse();
	}
</script>

{#if selectedChar && selectedChar.active}
	<button
		type="button"
		title={selectedChar.active.description}
		class="group flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all duration-300 max-md:px-3 max-md:py-2
			{canUse
			? 'border-amber-400/50 bg-[#252540] hover:border-amber-400 hover:bg-[#2a2a50] hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]'
			: 'cursor-not-allowed border-gray-700 bg-[#1a1a2e] opacity-50'}"
		disabled={!canUse}
		onclick={handleUse}
	>
		<div
			class="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-400/50 bg-[#1E1E2F]"
		>
			<img
				src={getCharacterHead(selectedChar.id)}
				alt={selectedChar.name}
				class="h-full w-full object-cover"
				onerror={(e) => handleAvatarError(e)}
			/>
		</div>
		<div class="text-left">
			<div class="text-xs font-bold text-white max-md:text-[0.7rem]">
				{selectedChar.active.name}
			</div>
			<div class="text-[0.6rem] text-gray-400 max-md:text-[0.55rem]">
				{canUse ? `⚡ ${selectedChar.active.description}` : '✓ Usada en este nivel'}
			</div>
		</div>
	</button>
{/if}
