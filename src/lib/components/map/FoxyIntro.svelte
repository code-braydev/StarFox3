<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { playTypewriter, playDialogueAdvance } from '$lib/audio/audio';

	let {
		open,
		onClose
	}: {
		open: boolean;
		onClose: () => void;
	} = $props();

	const dialogues: string[] = [
		'¡Alerta roja, Piloto! La Tierra está en peligro: un virus amenaza con destruir todo. Nosotros tenemos la única cura, pero debemos llevarla a tiempo.',
		'El problema es grave: la nave necesita combustible y repuestos para el viaje. Cada planeta en nuestro camino es una parada obligatoria para conseguir recursos.',
		'En cada estación deberás demostrar tu habilidad matemática. Resuelve las tablas de multiplicar para reparar la nave y seguir adelante.',
		'¡Mira el mapa! La primera estación ya está lista. Cada planeta completado nos acerca más a la Tierra. ¡Es hora de salvar el mundo, Piloto!'
	];

	let currentIndex = $state(0);
	let displayedText = $state('');
	let isTyping = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	let currentDialogue = $derived(dialogues[currentIndex] ?? '');
	let isFinished = $derived(currentIndex >= dialogues.length);
	let isLastDialogue = $derived(currentIndex === dialogues.length - 1);

	function startTyping() {
		clearTyping();
		displayedText = '';
		isTyping = true;
		let i = 0;
		intervalId = setInterval(() => {
			if (i < currentDialogue.length) {
				displayedText += currentDialogue[i];
				if (game.soundEnabled && i % 2 === 0) playTypewriter();
				i++;
			} else {
				clearTyping();
			}
		}, 40);
	}

	function clearTyping() {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
		isTyping = false;
	}

	function skipToEnd() {
		clearTyping();
		displayedText = currentDialogue;
	}

	function advanceDialogue() {
		if (game.soundEnabled) playDialogueAdvance();
		currentIndex++;
		if (currentIndex >= dialogues.length) {
			game.markIntroSeen();
			onClose();
		}
	}

	function skipAll() {
		clearTyping();
		game.markIntroSeen();
		onClose();
	}

	function handleOverlayClick() {
		if (isTyping) {
			skipToEnd();
		} else {
			advanceDialogue();
		}
	}

	function handleNext() {
		if (isTyping) {
			skipToEnd();
		} else {
			advanceDialogue();
		}
	}

	// Arrancar typewriter cuando se abre o cambia de diálogo
	$effect(() => {
		const idx = currentIndex;
		if (open && idx < dialogues.length) {
			startTyping();
		}
		return () => clearTyping();
	});
</script>

{#if open && !isFinished}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[2000] flex cursor-pointer flex-col justify-end bg-black/90 p-4"
		onclick={handleOverlayClick}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') handleOverlayClick();
			if (e.key === 'Escape') skipAll();
		}}
	>
		<!-- Botón Saltar historia (fijo arriba a la derecha) -->
		<button
			class="absolute top-6 right-6 z-30 cursor-pointer rounded-xl border border-gray-600/80 bg-[#1a1a3e]/80 px-4 py-2 text-xs font-bold text-gray-300 backdrop-blur-sm transition-all hover:border-amber-400 hover:text-white max-md:top-4 max-md:right-4 max-md:text-[0.7rem]"
			onclick={(e) => {
				e.stopPropagation();
				skipAll();
			}}
		>
			✕ Saltar intro
		</button>

		<!-- Capa de estrellas de fondo -->
		<div class="pointer-events-none absolute inset-0 opacity-30">
			<div
				class="absolute inset-0 bg-[radial-gradient(2px_2px_at_20%_30%,white_1px,transparent_0),radial-gradient(2px_2px_at_80%_70%,white_1px,transparent_0),radial-gradient(3px_3px_at_50%_50%,rgba(251,191,36,0.5)_1px,transparent_0)] bg-[length:200px_200px]"
			></div>
		</div>

		<!-- Foxy grande en la parte inferior -->
		<div class="relative z-10 flex flex-col items-center">
			<!-- Avatar de Foxy (grande) -->
			<div class="mb-4 animate-[float-spaceship_3s_ease-in-out_infinite]">
				<img
					src="/img/avatar-foxy.webp"
					alt="Foxy"
					class="h-32 w-32 rounded-full border-4 border-amber-400 bg-[#1E1E2F] p-2 shadow-[0_0_30px_rgba(251,191,36,0.4)] max-md:h-24 max-md:w-24"
				/>
			</div>

			<!-- Caja de diálogo (estilo RPG/clásico) -->
			<div class="relative mx-4 mb-4 w-full max-w-2xl max-md:mb-3">
				<!-- Marco de la caja -->
				<div
					class="rounded-2xl border-[3px] border-amber-400 bg-gradient-to-b from-[#1a1a3e] to-[#0f0f2a] p-6 shadow-[0_0_25px_rgba(251,191,36,0.3)] max-md:p-4"
				>
					<!-- Nombre del hablante -->
					<div
						class="absolute -top-4 left-6 rounded-lg bg-amber-400 px-4 py-1 max-md:left-4 max-md:px-3 max-md:py-0.5"
					>
						<span class="font-arcade text-xs text-[#1E1E2F] max-md:text-[0.6rem]">FOXY</span>
					</div>

					<!-- Texto con typewriter -->
					<p
						class="mt-2 min-h-[4rem] font-sans text-lg leading-relaxed text-white max-md:min-h-[3rem] max-md:text-sm max-md:leading-relaxed"
					>
						{displayedText}{#if isTyping}<span
								class="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-amber-400 align-middle max-md:h-4"
							></span>{/if}
					</p>
				</div>

				<!-- Flecha de la caja (apuntando a Foxy) -->
				<div
					class="absolute -top-3 left-1/2 h-0 w-0 -translate-x-1/2 border-r-[10px] border-b-[12px] border-l-[10px] border-r-transparent border-b-amber-400 border-l-transparent"
				></div>
			</div>

			<!-- Botón Siguiente / ¡Despegar! -->
			<div class="mb-6 max-md:mb-4">
				{#if !isTyping}
					<button
						class="cursor-pointer rounded-2xl border-none bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3 font-bold text-[#1E1E2F] shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] active:scale-95 max-md:px-6 max-md:py-2 max-md:text-[0.85rem]"
						onclick={(e) => {
							e.stopPropagation();
							handleNext();
						}}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.stopPropagation();
								handleNext();
							}
						}}
					>
						{isLastDialogue ? '¡Despegar! 🚀' : 'Siguiente →'}
					</button>
				{/if}
			</div>

			<!-- Contador de diálogos -->
			<div class="mb-8 flex gap-2 max-md:mb-4">
				{#each dialogues as _, i (i)}
					<div
						class="h-2 w-2 rounded-full transition-all duration-300"
						class:bg-amber-400={i <= currentIndex}
						class:bg-gray-600={i > currentIndex}
						class:scale-125={i === currentIndex}
					></div>
				{/each}
			</div>
		</div>
	</div>
{/if}
