<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { characters, type Character } from '$lib/constants/characters';
	import { playClick } from '$lib/audio/audio';
	import CharacterCard from '$lib/components/profile/CharacterCard.svelte';

	let selectedChar = $derived(
		characters.find((c) => c.id === game.characters.selected) ?? characters[0]
	);

	let totalStars = $derived(game.progress.totalStars);
	let totalLevels = $derived(game.progress.levelsCompleted.length);
	let totalGems = $derived(game.progress.gems);

	function handleBack() {
		if (game.soundEnabled) playClick();
		goto('/map');
	}

	function handleSelectCharacter(char: Character) {
		if (game.soundEnabled) playClick();
		game.selectCharacter(char.id);
	}
</script>

<svelte:head>
	<title>Perfil - Star Fox 3</title>
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
			<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">PERFIL</h1>
		</div>

		<div class="flex items-center gap-2">
			<span class="text-sm max-md:text-xs">💎</span>
			<span class="font-arcade text-xs text-[#FBBF24] max-md:text-[0.65rem]">{totalGems}</span>
		</div>
	</header>

	<div
		class="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center gap-8 px-6 py-6 max-md:px-4 max-md:py-4"
	>
		<!-- Estadísticas -->
		<div class="flex gap-6 max-md:gap-4">
			<div class="rounded-2xl bg-[#252540] p-4 text-center max-md:p-3">
				<div class="font-arcade text-lg text-[#FBBF24]">{totalStars}</div>
				<div class="text-[0.7rem] text-gray-400">Estrellas</div>
			</div>
			<div class="rounded-2xl bg-[#252540] p-4 text-center max-md:p-3">
				<div class="font-arcade text-lg text-[#FBBF24]">{totalLevels}/25</div>
				<div class="text-[0.7rem] text-gray-400">Niveles</div>
			</div>
			<div class="rounded-2xl bg-[#252540] p-4 text-center max-md:p-3">
				<div class="font-arcade text-lg text-[#FBBF24]">{totalGems}</div>
				<div class="text-[0.7rem] text-gray-400">Gemas</div>
			</div>
		</div>

		<!-- Personaje actual -->
		<div
			class="w-full max-w-md rounded-3xl border-2 border-amber-400/30 bg-[#252540] p-6 text-center"
		>
			<h2 class="mb-3 text-sm font-bold text-[#FBBF24]">Personaje Actual</h2>
			<div class="mb-4 flex items-center justify-center gap-4">
				<div
					class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400/50 bg-[#1E1E2F] text-3xl"
				>
					{selectedChar.animal === 'Zorro'
						? '🦊'
						: selectedChar.animal === 'Perro'
							? '🐶'
							: selectedChar.animal === 'Gato'
								? '🐱'
								: selectedChar.animal === 'Robot'
									? '🤖'
									: selectedChar.animal === 'Dragón'
										? '🐉'
										: selectedChar.animal === 'Ardilla Voladora'
											? '🐿️'
											: selectedChar.animal === 'Morsa'
												? '🦭'
												: selectedChar.animal === 'Mapache'
													? '🦝'
													: selectedChar.animal === 'Camaleón'
														? '🦎'
														: selectedChar.animal === 'Oso Pardo'
															? '🐻'
															: selectedChar.animal === 'Axolote'
																? '🦎'
																: selectedChar.animal === 'Lince'
																	? '🐆'
																	: selectedChar.animal === 'Cobra'
																		? '🐍'
																		: selectedChar.animal === 'Murciélago Cyborg'
																			? '🦇'
																			: '🔥'}
				</div>
				<div class="text-left">
					<div class="text-lg font-bold text-white">{selectedChar.name}</div>
					<div class="text-[0.75rem] text-gray-400">
						{selectedChar.element} / {selectedChar.role}
					</div>
				</div>
			</div>

			<!-- Pasivo -->
			<div class="mb-2 rounded-xl bg-[#1E1E2F] p-3">
				<div class="mb-1 text-[0.7rem] font-bold text-emerald-400">PASIVO</div>
				<div class="text-[0.8rem] font-bold text-white">{selectedChar.passive.name}</div>
				<div class="text-[0.7rem] text-gray-300">{selectedChar.passive.description}</div>
			</div>

			<!-- Activo -->
			<div class="rounded-xl bg-[#1E1E2F] p-3">
				<div class="mb-1 text-[0.7rem] font-bold text-amber-400">ACTIVO</div>
				<div class="text-[0.8rem] font-bold text-white">{selectedChar.active.name}</div>
				<div class="text-[0.7rem] text-gray-300">{selectedChar.active.description}</div>
				<div class="mt-1 text-[0.6rem] text-gray-500">
					{selectedChar.active.cooldownType === 'real'
						? `Cooldown: ${selectedChar.active.cooldownMinutes} min`
						: '1 uso por nivel'}
				</div>
			</div>
		</div>

		<!-- Grid de personajes -->
		<div class="w-full">
			<h2 class="mb-4 text-center text-sm font-bold text-[#FBBF24]">ELIGE TU PERSONAJE</h2>
			<div
				class="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-md:gap-3 sm:grid-cols-4 lg:grid-cols-5"
			>
				{#each characters as char (char.id)}
					<CharacterCard
						character={char}
						isSelected={char.id === game.characters.selected}
						isUnlocked={game.isCharacterUnlocked(char.id)}
						onSelect={() => handleSelectCharacter(char)}
					/>
				{/each}
			</div>
		</div>
	</div>
</div>
