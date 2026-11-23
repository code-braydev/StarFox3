<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { characters } from '$lib/constants/characters';
	import { playClick } from '$lib/audio/audio';

	let {
		message
	}: {
		message?: string;
	} = $props();

	let selectedId = $derived(game.characters.selected || 'foxy');
	let character = $derived(characters.find((c) => c.id === selectedId) ?? characters[0]);
	let equippedFrame = $derived(game.shop.equipped.frame);
	let equippedAccessory = $derived(game.shop.equipped.accessory);

	let isJumping = $state(false);
	let isCollapsed = $state(false);
	let imageFailed = $state(false);
	let accessoryImageFailed = $state(false);

	// Diálogo contextual del personaje
	let dialogMessage = $derived(message ?? getAutoMessage());

	function getAutoMessage(): string {
		const completed = game.progress.levelsCompleted.length;
		const total = 25;
		const name = game.player.name || 'Piloto';

		if (completed === 0) {
			return `¡Hola ${name}! Soy ${character.name}. ¡Elige un destino en el mapa estelar para iniciar nuestra misión!`;
		} else if (completed === total) {
			return `¡Victoria total, ${name}! Completamos las 25 misiones y llevamos la cura a salvo. ¡Eres increíble!`;
		} else if (completed <= 3) {
			return `¡Buen despegue, ${name}! Llevamos ${completed}/${total} sectores explorados. La nave rinde al 100%.`;
		} else if (completed <= 12) {
			return `¡Sistemas estables! Ya superamos la Fase 1. Mantén la concentración, ${name}.`;
		} else {
			return `¡Casi llegamos a la Tierra, ${name}! Faltan solo ${total - completed} sectores por liberar.`;
		}
	}

	function handleCharacterClick() {
		if (game.soundEnabled) playClick();
		if (isCollapsed) {
			isCollapsed = false;
		}
		isJumping = true;
		setTimeout(() => {
			isJumping = false;
		}, 600);
	}

	// Mapeo de emojis/iconos fallback mientras el usuario descarga los archivos PNG/WebP
	const characterEmojiMap: Record<string, string> = {
		foxy: '🦊',
		rex: '🐶',
		luna: '🐱',
		astro: '🤖',
		nova: '🐉',
		pip: '🐿️',
		tusk: '🦭',
		gizmo: '🦝',
		sly: '🦎',
		brutus: '🐻',
		vortex: '🦎',
		kira: '🐆',
		fang: '🐍',
		echo: '🦇',
		blaze: '🦅'
	};

	const accessoryEmojiMap: Record<string, string> = {
		'acc-sunglasses': '🕶️',
		'acc-hat': '🧙',
		'acc-crown': '👑',
		'acc-wings': '🪽',
		'acc-shield': '🛡️'
	};
</script>

<div class="flex items-end gap-2.5">
	<!-- Contenedor compacto del Personaje con sus capas (Marco + Personaje + Accesorio) -->
	<div
		class="relative flex flex-shrink-0 cursor-pointer flex-col items-center transition-transform duration-300 select-none
			{isJumping ? '-translate-y-3 scale-110' : 'hover:scale-105'}"
		onclick={handleCharacterClick}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && handleCharacterClick()}
		title="Haz clic para interactuar con {character.name}"
	>
		<!-- Avatar Base compacto -->
		<div class="relative flex h-18 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a2a4e]/95 to-[#15152a]/95 p-1 shadow-[0_0_20px_rgba(251,191,36,0.25)] backdrop-blur-md max-md:h-14 max-md:w-12">
			<!-- RECURSO: static/img/characters/bodies/{character.id}.png (Fallback: heads/{character.id}.png) -->
			{#if !imageFailed}
				<img
					src="/img/characters/bodies/{character.id}.png"
					alt={character.name}
					class="h-full w-full rounded-xl object-contain filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]"
					onerror={(e) => {
						const img = e.currentTarget as HTMLImageElement;
						if (!img.src.includes('/heads/')) {
							img.src = `/img/characters/heads/${character.id}.png`;
						} else {
							imageFailed = true;
						}
					}}
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center rounded-xl bg-amber-400/10 text-2xl">
					{characterEmojiMap[character.id] ?? '🦊'}
				</div>
			{/if}

			<!-- RECURSO: static/img/accessories/{equippedAccessory}.png -->
			{#if equippedAccessory}
				<div class="pointer-events-none absolute -top-2.5 -right-2 z-20 flex h-7 w-7 items-center justify-center">
					{#if !accessoryImageFailed}
						<img
							src="/img/accessories/{equippedAccessory}.png"
							alt="Accesorio"
							class="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
							onerror={() => {
								accessoryImageFailed = true;
							}}
						/>
					{:else}
						<span class="text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
							{accessoryEmojiMap[equippedAccessory] ?? '✨'}
						</span>
					{/if}
				</div>
			{/if}

			<!-- RECURSO: static/img/frames/{equippedFrame}.png -->
			{#if equippedFrame}
				<div class="pointer-events-none absolute inset-0 z-30">
					<div
						class="h-full w-full rounded-2xl border-2
							{equippedFrame === 'frame-fire' ? 'border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]' : ''}
							{equippedFrame === 'frame-wood' ? 'border-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.7)]' : ''}
							{equippedFrame === 'frame-gold' ? 'border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.9)]' : ''}
							{equippedFrame === 'frame-crystal' ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.9)]' : ''}
							{equippedFrame === 'frame-robot' ? 'border-slate-300 shadow-[0_0_12px_rgba(148,163,184,0.8)]' : ''}
						"
					></div>
				</div>
			{:else}
				<div class="pointer-events-none absolute inset-0 rounded-2xl border border-amber-400/50"></div>
			{/if}
		</div>

		<!-- Etiqueta del Compañero -->
		<div class="mt-1 flex items-center gap-1 rounded-md border border-amber-400/30 bg-[#16162a]/95 px-1.5 py-0.5 shadow-sm">
			<span class="font-arcade text-[0.5rem] text-amber-400">{character.name}</span>
		</div>
	</div>

	<!-- Bocadillo de Diálogo compacto abajo a la izquierda -->
	{#if !isCollapsed}
		<div
			class="relative max-w-[270px] rounded-2xl border border-amber-400/35 bg-[#1a1a35]/95 px-3.5 py-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-md max-sm:max-w-[215px]"
		>
			<!-- Flecha del bocadillo (apunta a la izquierda al personaje) -->
			<div
				class="absolute bottom-5 -left-2 h-0 w-0 border-t-[6px] border-r-[8px] border-b-[6px] border-t-transparent border-r-[#1a1a35] border-b-transparent"
			></div>

			<div class="mb-1 flex items-center justify-between gap-2 border-b border-gray-700/50 pb-1">
				<span class="font-arcade text-[0.5rem] tracking-wider text-amber-400">
					📡 {character.name.toUpperCase()} · {character.role.toUpperCase()}
				</span>
				<button
					type="button"
					class="cursor-pointer text-[0.65rem] leading-none text-gray-400 hover:text-white"
					onclick={() => (isCollapsed = true)}
					title="Minimizar diálogo"
					aria-label="Minimizar diálogo"
				>
					✕
				</button>
			</div>
			<p class="text-[0.72rem] leading-snug text-gray-200 max-sm:text-[0.68rem]">
				{dialogMessage}
			</p>
		</div>
	{:else}
		<button
			type="button"
			class="mb-4 flex cursor-pointer items-center gap-1 rounded-full border border-amber-400/40 bg-[#1a1a35]/90 px-2.5 py-1 text-[0.65rem] text-amber-300 shadow-md backdrop-blur-md transition-all hover:border-amber-400 hover:scale-105"
			onclick={() => (isCollapsed = false)}
			title="Mostrar mensaje"
		>
			💬 <span class="max-sm:hidden">Mensaje</span>
		</button>
	{/if}
</div>
