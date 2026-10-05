<script lang="ts">
	import type { Character } from '$lib/constants/characters';
	import { game } from '$lib/stores/game.svelte';
	import { playClick, playSuccess } from '$lib/audio/audio';

	let {
		character,
		isSelected,
		isUnlocked,
		onSelect
	}: {
		character: Character;
		isSelected: boolean;
		isUnlocked: boolean;
		onSelect: () => void;
	} = $props();

	let canUnlock = $derived(!isUnlocked && game.canUnlockCharacter(character.id));

	let animalEmoji = $derived(
		character.animal === 'Zorro'
			? '🦊'
			: character.animal === 'Perro'
				? '🐶'
				: character.animal === 'Gato'
					? '🐱'
					: character.animal === 'Robot'
						? '🤖'
						: character.animal === 'Dragón'
							? '🐉'
							: character.animal === 'Ardilla Voladora'
								? '🐿️'
								: character.animal === 'Morsa'
									? '🦭'
									: character.animal === 'Mapache'
										? '🦝'
										: character.animal === 'Camaleón'
											? '🦎'
											: character.animal === 'Oso Pardo'
												? '🐻'
												: character.animal === 'Axolote'
													? '🦎'
													: character.animal === 'Lince'
														? '🐆'
														: character.animal === 'Cobra'
															? '🐍'
															: character.animal === 'Murciélago Cyborg'
																? '🦇'
																: '🔥'
	);

	let unlockLabel = $derived(() => {
		if (character.unlockType === 'free') return 'Gratis';
		if (character.unlockType === 'stars') return `${character.unlockValue}⭐`;
		if (character.unlockType === 'gems') return `${character.unlockValue}💎`;
		if (character.unlockType === 'level') return `Nivel ${character.unlockValue}`;
		return '';
	});

	function handleClick() {
		if (isUnlocked) {
			if (game.soundEnabled) playClick();
			onSelect();
		} else if (canUnlock) {
			if (game.soundEnabled) playSuccess();
			game.unlockCharacterWithCheck(character.id);
		}
	}
</script>

<button
	class="group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all duration-300 max-md:p-2
		{isSelected
		? 'border-amber-400 bg-[#252540] shadow-[0_0_15px_rgba(251,191,36,0.3)]'
		: isUnlocked
			? 'border-gray-600 bg-[#1E1E2F] hover:border-amber-400/50 hover:bg-[#252540]'
			: canUnlock
				? 'border-emerald-500/60 bg-[#1E1E2F] hover:border-emerald-400 hover:bg-[#252540]'
				: 'border-gray-700 bg-[#1a1a2e] opacity-50'}"
	onclick={isUnlocked || canUnlock ? handleClick : undefined}
	disabled={!isUnlocked && !canUnlock}
>
	{#if !isUnlocked}
		<div
			class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/60 {canUnlock
				? 'bg-emerald-900/40'
				: ''}"
		>
			<span class="text-lg">{unlockLabel()}</span>
			{#if canUnlock}
				<span class="mt-1 animate-pulse text-[0.6rem] font-bold text-emerald-400">
					¡Desbloquear!
				</span>
			{/if}
		</div>
	{/if}

	<div
		class="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f0f2a] text-2xl transition-transform duration-300 max-md:h-10 max-md:w-10 max-md:text-xl
			{isUnlocked ? 'group-hover:scale-110' : ''}"
	>
		{animalEmoji}
	</div>

	<div class="text-center">
		<div
			class="text-[0.7rem] font-bold {isSelected
				? 'text-amber-400'
				: 'text-white'} max-md:text-[0.6rem]"
		>
			{character.name}
		</div>
		<div class="text-[0.55rem] text-gray-400">{character.element}</div>
	</div>

	{#if isSelected}
		<div
			class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 text-[0.5rem] font-bold text-[#1E1E2F]"
		>
			✓
		</div>
	{/if}
</button>
