<script lang="ts">
	import { goto } from '$app/navigation';
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';

	const minigames = [
		{
			id: 'velocidad',
			name: 'Velocidad Mental',
			description: '30 cálculos relámpago de la cabina. ¡Pon a prueba tus reflejos!',
			icon: '⚡',
			color: '#FBBF24',
			energyCost: 0,
			reward: 'Recarga hasta +40⚡ de energía y gana 💎 gemas.',
			route: '/minigames/velocidad',
			bgKey: 'bg-velocidad.webp'
		},
		{
			id: 'precision',
			name: 'Precisión Infinita',
			description: 'Calibración de reactores críticos. 3 corazones. ¡No falles!',
			icon: '🎯',
			color: '#EF4444',
			energyCost: 0,
			reward: 'Recarga hasta +50⚡ de energía y restaura vidas.',
			route: '/minigames/precision',
			bgKey: 'bg-precision.webp'
		},
		{
			id: 'zen',
			name: 'Modo Zen Espacial',
			description: 'Vuelo orbital relajado. Sin tiempo, sin penalizaciones.',
			icon: '🧘',
			color: '#22C55E',
			energyCost: 0,
			reward: 'Recarga tranquila de +20⚡ de energía y 💎 gemas.',
			route: '/minigames/zen',
			bgKey: 'bg-zen.webp'
		}
	];

	function handleBack() {
		if (game.soundEnabled) playClick();
		goto('/map');
	}

	function handlePlay(route: string) {
		if (game.soundEnabled) playClick();
		goto(route);
	}
</script>

<svelte:head>
	<title>Minijuegos y Mantenimiento - Star Fox 3</title>
</svelte:head>

<div
	class="relative flex min-h-dvh w-full flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
	style="background-image: url('{game.shop.equipped.background ? `/img/background/${game.shop.equipped.background}.webp` : '/img/bg-map.webp'}');"
>
	<!-- RECURSO: Fondo equipado static/img/background/{game.shop.equipped.background}.webp -->
	<div class="absolute inset-0 bg-slate-950/85"></div>

	<!-- Header de Minijuegos -->
	<header
		class="relative z-20 flex w-full items-center justify-between border-b border-gray-800/80 bg-slate-950/60 px-6 py-4 backdrop-blur-sm max-md:px-4 max-md:py-3"
	>
		<button
			class="cursor-pointer rounded-xl border border-gray-600 bg-[#252540] px-4 py-2 text-xs text-gray-300 transition-all hover:border-amber-400/50 hover:text-white max-md:px-3 max-md:text-[0.65rem]"
			onclick={handleBack}
		>
			← Volver al Mapa
		</button>

		<div class="text-center">
			<h1 class="font-arcade text-sm tracking-wider text-[#FBBF24] max-md:text-xs">
				MANTENIMIENTO Y MINIJUEGOS
			</h1>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex items-center gap-1 rounded-lg bg-amber-400/10 px-2.5 py-1 border border-amber-400/30">
				<span class="text-xs">⚡</span>
				<span class="font-arcade text-xs text-amber-400 max-md:text-[0.65rem]">
					{game.energy.current}/{game.energy.max}
				</span>
			</div>
			<div class="flex items-center gap-1 rounded-lg bg-cyan-400/10 px-2.5 py-1 border border-cyan-400/30">
				<span class="text-xs">💎</span>
				<span class="font-arcade text-xs text-cyan-400 max-md:text-[0.65rem]">
					{game.progress.gems}
				</span>
			</div>
		</div>
	</header>

	<div
		class="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 py-8 max-md:px-4 max-md:py-4"
	>
		<div class="text-center max-w-xl">
			<h2 class="font-arcade text-base text-white mb-2">SISTEMAS AUXILIARES DEL GREAT FOX</h2>
			<p class="text-sm text-gray-300 max-md:text-xs">
				¿Te quedaste sin combustible? Ayuda en el mantenimiento de la nave para recargar energía ⚡ y acumular gemas 💎 sin arriesgar tu progreso.
			</p>
		</div>

		<div class="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
			{#each minigames as mg (mg.id)}
				<!-- RECURSO: static/img/minigames/{mg.bgKey} para fondos personalizados de cada minijuego -->
				<button
					class="group relative flex cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 p-6 transition-all duration-300 max-md:p-4 border-gray-600 bg-gradient-to-b from-[#252540] to-[#17172e] hover:border-amber-400 hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:-translate-y-1"
					onclick={() => handlePlay(mg.route)}
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110 shadow-lg"
						style="background-color: {mg.color}20; border: 2px solid {mg.color}60;"
					>
						{mg.icon}
					</div>

					<div class="text-center">
						<h3 class="mb-1 text-base font-bold text-white group-hover:text-amber-400 transition-colors">
							{mg.name}
						</h3>
						<p class="mb-3 text-[0.75rem] text-gray-300 leading-relaxed">{mg.description}</p>
						<div
							class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-bold"
							style="background-color: {mg.color}20; color: {mg.color};"
						>
							⚡ Recarga Gratuita
						</div>
					</div>

					<div class="w-full rounded-xl bg-slate-950/60 p-2.5 text-center border border-gray-800">
						<p class="text-[0.7rem] font-medium text-emerald-300">{mg.reward}</p>
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>
