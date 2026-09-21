<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';

	const minigames = [
		{
			id: 'velocidad',
			name: 'Velocidad Mental',
			description: '30 preguntas rápidas. Sin límite de tiempo, ¡pero sé veloz!',
			icon: '⚡',
			color: '#FBBF24',
			energyCost: 1,
			reward: 'Recupera 1 energía extra por cada 10 aciertos',
			route: '/minigames/velocidad'
		},
		{
			id: 'precision',
			name: 'Precisión Infinita',
			description: '50 preguntas. 3 corazones. ¡No fallés!',
			icon: '🎯',
			color: '#EF4444',
			energyCost: 2,
			reward: 'Recupera 1 corazón por cada 15 aciertos seguidos',
			route: '/minigames/precision'
		},
		{
			id: 'zen',
			name: 'Modo Zen',
			description: 'Practica sin presión. Sin tiempo, sin corazones.',
			icon: '🧘',
			color: '#22C55E',
			energyCost: 0,
			reward: 'Práctica libre. Sin recompensas, sin penalizaciones.',
			route: '/minigames/zen'
		}
	];

	function handleBack() {
		if (game.soundEnabled) playClick();
		goto('/map');
	}

	function handlePlay(route: string, energyCost: number) {
		if (game.soundEnabled) playClick();
		if (energyCost > 0 && !game.useEnergy(energyCost)) return;
		goto(route);
	}
</script>

<svelte:head>
	<title>Minijuegos - Star Fox 3</title>
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
			<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">MINIJUEGOS</h1>
		</div>

		<div class="flex items-center gap-2">
			<span class="text-sm max-md:text-xs">⚡</span>
			<span class="font-arcade text-xs text-[#FBBF24] max-md:text-[0.65rem]">
				{game.energy.current}/{game.energy.max}
			</span>
		</div>
	</header>

	<div
		class="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center gap-8 px-6 py-6 max-md:px-4 max-md:py-4"
	>
		<p class="text-center text-sm text-gray-400">
			Recuperá energía jugando minijuegos. ¡Cada uno tiene su recompensa!
		</p>

		<div class="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
			{#each minigames as mg (mg.id)}
				<button
					class="group flex cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 p-6 transition-all duration-300 max-md:p-4
						{game.energy.current >= mg.energyCost
						? 'border-gray-600 bg-[#252540] hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]'
						: 'cursor-not-allowed border-gray-700 bg-[#1a1a2e] opacity-50'}"
					disabled={game.energy.current < mg.energyCost}
					onclick={() => handlePlay(mg.route, mg.energyCost)}
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full text-3xl transition-transform duration-300 group-hover:scale-110"
						style="background-color: {mg.color}20; border: 2px solid {mg.color}50;"
					>
						{mg.icon}
					</div>

					<div class="text-center">
						<h3 class="mb-1 text-base font-bold text-white">{mg.name}</h3>
						<p class="mb-2 text-[0.75rem] text-gray-400">{mg.description}</p>
						<div
							class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-bold"
							style="background-color: {mg.color}20; color: {mg.color};"
						>
							{#if mg.energyCost === 0}
								Gratis
							{:else}
								⚡ {mg.energyCost} energía
							{/if}
						</div>
					</div>

					<p class="text-[0.65rem] text-gray-500">{mg.reward}</p>
				</button>
			{/each}
		</div>
	</div>
</div>
