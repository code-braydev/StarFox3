<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { characters, getCharacterHead, getCharacterBody, type Character } from '$lib/constants/characters';
	import { getEquippedBackground, handleAvatarError } from '$lib/constants/assets';
	import { playClick } from '$lib/audio/audio';
	import { CharacterCard } from '$lib/components/profile';

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

<div
	class="relative flex min-h-dvh w-full flex-col items-center overflow-hidden bg-[#0f0f2a] bg-cover bg-center bg-no-repeat"
	style="background-image: url('{getEquippedBackground(game.shop.equipped.background)}');"
>
	<div class="absolute inset-0 bg-slate-950/55"></div>

	<header
		class="theme-header relative z-20 flex w-full items-center justify-between border-b-2 border-amber-400/40 bg-[#252540]/75 px-6 py-4 backdrop-blur-md max-md:px-4 max-md:py-3"
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

		<!-- Curso Vinculado (Flujo Estudiante - Profesor) -->
		<div class="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-[#252540]/90 p-4">
			{#if session.isStudent && session.studentSession}
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<div class="text-xs font-bold text-cyan-400">🏫 CURSO VINCULADO</div>
						<div class="mt-0.5 text-sm font-bold text-white">
							{session.studentSession.className} · <span class="font-mono text-amber-400">{session.studentSession.classCode}</span>
						</div>
						<div class="text-xs text-gray-400">Alumno: {session.studentSession.displayName}</div>
					</div>
					<div class="flex gap-2">
						<button
							type="button"
							class="cursor-pointer rounded-xl border border-amber-400/40 bg-transparent px-3 py-1.5 text-xs text-amber-300 transition-all hover:bg-amber-400/10"
							onclick={() => goto('/join')}
						>
							Cambiar
						</button>
						<button
							type="button"
							class="cursor-pointer rounded-xl border border-gray-600 bg-transparent px-3 py-1.5 text-xs text-gray-400 transition-all hover:text-white"
							onclick={() => session.studentLeave()}
						>
							Salir
						</button>
					</div>
				</div>
			{:else}
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<div class="text-xs font-bold text-cyan-400">🏫 ¿TIENES CÓDIGO DE CLASE?</div>
						<div class="mt-0.5 text-xs text-gray-300">
							Vincúlate al curso de tu profesor para sincronizar tu progreso.
						</div>
					</div>
					<button
						type="button"
						class="cursor-pointer rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-[#1E1E2F] transition-all hover:scale-105"
						onclick={() => goto('/join')}
					>
						🚀 Unirme a clase
					</button>
				</div>
			{/if}
		</div>

		<!-- Personaje actual -->
		<div
			class="w-full max-w-md rounded-3xl border-2 border-amber-400/30 bg-[#252540] p-6 text-center"
		>
			<h2 class="mb-3 text-sm font-bold text-[#FBBF24]">Personaje Actual</h2>
			<div class="mb-4 flex flex-col items-center justify-center gap-3">
				<!-- Ilustración de Cuerpo Completo -->
				<div class="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#1a1a38] to-[#121226] p-2 border border-amber-400/20 shadow-[inner_0_0_20px_rgba(0,0,0,0.5)]">
					<img
						src={getCharacterBody(selectedChar.id)}
						alt={selectedChar.name}
						class="h-full w-full object-contain animate-[float_4s_ease-in-out_infinite] drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]"
						onerror={(e) => handleAvatarError(e, getCharacterHead(selectedChar.id))}
					/>
				</div>

				<div class="flex items-center gap-3">
					<div class="h-12 w-12 overflow-hidden rounded-full border-2 border-amber-400/60 bg-[#1E1E2F]">
						<img
							src={getCharacterHead(selectedChar.id)}
							alt={selectedChar.name}
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="text-left">
						<div class="text-lg font-bold text-white">{selectedChar.name}</div>
						<div class="text-[0.75rem] text-gray-400">
							{selectedChar.element} / {selectedChar.role}
						</div>
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

		<!-- Controles de Reinicio -->
		<div class="mt-4 flex flex-wrap justify-center gap-3 border-t border-gray-800 pt-6 w-full">
			<button
				class="cursor-pointer rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs text-red-300 transition-all hover:bg-red-500/20"
				onclick={() => {
					session.studentLeave();
					game.resetAll();
					goto('/');
				}}
			>
				🔄 Reiniciar Progreso Completo
			</button>
		</div>
	</div>
</div>
