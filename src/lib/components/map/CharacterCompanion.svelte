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

<div class="flex w-full items-center gap-4 max-md:flex-col">
	<!-- Contenedor del Personaje con sus capas (Marco + Personaje + Accesorio) -->
	<div
		class="relative flex flex-shrink-0 cursor-pointer flex-col items-center transition-transform duration-300 select-none
			{isJumping ? '-translate-y-4 scale-110' : 'hover:scale-105'}"
		onclick={handleCharacterClick}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && handleCharacterClick()}
		title="Haz clic para interactuar con tu compañero"
	>
		<!-- Avatar Base con animación suave -->
		<div class="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a2a4e] to-[#15152a] p-1.5 shadow-[0_0_25px_rgba(251,191,36,0.25)] max-md:h-20 max-md:w-20">
			
			<!-- RECURSO: static/img/characters/{character.id}.webp -->
			{#if character.id === 'foxy' && !imageFailed}
				<img
					src="/img/avatar-foxy.webp"
					alt={character.name}
					class="h-full w-full rounded-xl object-contain"
					onerror={() => {
						imageFailed = true;
					}}
				/>
			{:else if !imageFailed}
				<!-- RECURSO: static/img/characters/{character.id}.webp (Colocar aquí la imagen del personaje) -->
				<img
					src="/img/characters/{character.id}.webp"
					alt={character.name}
					class="h-full w-full rounded-xl object-contain"
					onerror={() => {
						imageFailed = true;
					}}
				/>
			{:else}
				<!-- FALLBACK TEMPORAL si no existe la imagen -->
				<div class="flex h-full w-full items-center justify-center rounded-xl bg-amber-400/10 text-4xl">
					{characterEmojiMap[character.id] ?? '🦊'}
				</div>
			{/if}

			<!-- RECURSO: static/img/accessories/{equippedAccessory}.png -->
			{#if equippedAccessory}
				<div class="pointer-events-none absolute -top-3 -right-2 z-20 flex h-10 w-10 items-center justify-center">
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
						<!-- FALLBACK TEMPORAL DEL ACCESORIO -->
						<span class="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
							{accessoryEmojiMap[equippedAccessory] ?? '✨'}
						</span>
					{/if}
				</div>
			{/if}

			<!-- RECURSO: static/img/frames/{equippedFrame}.png -->
			{#if equippedFrame}
				<div class="pointer-events-none absolute inset-0 z-30">
					<!-- RECURSO DE MARCO: static/img/frames/{equippedFrame}.png -->
					<!-- Si aún no tienes el PNG, aplicamos un borde temático con resplandor neón -->
					<div
						class="h-full w-full rounded-2xl border-[3px]
							{equippedFrame === 'frame-fire' ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]' : ''}
							{equippedFrame === 'frame-wood' ? 'border-amber-700 shadow-[0_0_10px_rgba(180,83,9,0.7)]' : ''}
							{equippedFrame === 'frame-gold' ? 'border-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.9)]' : ''}
							{equippedFrame === 'frame-crystal' ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]' : ''}
							{equippedFrame === 'frame-robot' ? 'border-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.8)]' : ''}
						"
					></div>
				</div>
			{:else}
				<div class="pointer-events-none absolute inset-0 rounded-2xl border-2 border-amber-400/50"></div>
			{/if}
		</div>

		<!-- Etiqueta del Compañero -->
		<div class="mt-1 flex items-center gap-1 rounded-md bg-[#16162a]/90 px-2 py-0.5 border border-amber-400/30">
			<span class="font-arcade text-[0.6rem] text-amber-400">{character.name}</span>
			<span class="text-[0.55rem] text-gray-400">({character.role})</span>
		</div>
	</div>

	<!-- Bocadillo de Diálogo (Speech Bubble espacial) -->
	<div
		class="relative flex-1 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-[#23233e] to-[#16162c] p-4 shadow-[0_0_20px_rgba(251,191,36,0.12)] max-md:w-full"
	>
		<!-- Flecha del bocadillo para desktop (apunta a la izquierda al personaje) -->
		<div
			class="max-md:hidden absolute top-6 -left-2.5 h-0 w-0 border-t-[8px] border-r-[10px] border-b-[8px] border-t-transparent border-r-[#23233e] border-b-transparent"
		></div>
		<!-- Flecha para móvil (apunta arriba al personaje) -->
		<div
			class="md:hidden absolute -top-2.5 left-1/2 -translate-x-1/2 h-0 w-0 border-r-[8px] border-b-[10px] border-l-[8px] border-r-transparent border-b-[#23233e] border-l-transparent"
		></div>

		<div class="flex items-center justify-between border-b border-gray-700/50 pb-1.5 mb-1.5">
			<span class="font-arcade text-[0.6rem] tracking-wider text-amber-400">
				TRANSMISIÓN DE CABINA
			</span>
			<span class="text-[0.65rem] text-cyan-400 font-arcade">EN VIVO</span>
		</div>
		<p class="text-[0.85rem] leading-relaxed text-gray-200 max-md:text-[0.8rem]">
			{dialogMessage}
		</p>
	</div>
</div>
