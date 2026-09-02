<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import GoalModal from '$lib/components/GoalModal.svelte';
	import { game } from '$lib/stores/game.svelte';
	import { goto } from '$app/navigation';

	let showNameModal = $state(false);
	let showGoalModal = $state(false);

	function onPlay() {
		if (game.isRegistered) {
			if (game.hasGoal) {
				goto('/map');
			} else {
				showGoalModal = true;
			}
		} else {
			showNameModal = true;
		}
	}

	function onNameModalClose() {
		showNameModal = false;
		if (!game.hasGoal) {
			showGoalModal = true;
		}
	}
</script>

<div
	class="hangar-page relative flex min-h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden bg-[url('/img/bg-hangar.webp')] bg-cover bg-center bg-no-repeat px-6 after:pointer-events-none after:fixed after:inset-0 after:z-10 after:bg-black/55"
>
	<!-- Capa 1: Estrellas base (blancas) -->
	<div
		class="pointer-events-none fixed inset-0 z-0 animate-drift bg-[radial-gradient(2px_2px_at_10%_20%,white_2px,rgba(255,255,255,0.2)_3px,transparent_0),radial-gradient(2px_2px_at_40%_60%,white_2px,transparent_0),radial-gradient(2px_2px_at_70%_15%,white_2px,transparent_0),radial-gradient(3px_3px_at_90%_80%,white_3px,rgba(255,255,255,0.3)_5px,transparent_0),radial-gradient(2px_2px_at_25%_85%,white_2px,transparent_0),radial-gradient(3px_3px_at_55%_35%,rgba(251,191,36,1)_2px,rgba(251,191,36,0.4)_5px,transparent_0),radial-gradient(2.5px_2.5px_at_85%_50%,rgba(99,102,241,0.8)_2px,transparent_0)] bg-[length:250px_250px,180px_180px,220px_220px,160px_160px,300px_300px,200px_200px,170px_170px] opacity-90"
	></div>

	<!-- Capa 2: Estrellas coloreadas (dorado + índigo) -->
	<div
		class="pointer-events-none fixed inset-0 z-0 animate-drift-reverse bg-[radial-gradient(2px_2px_at_10%_20%,white_2px,transparent_0),radial-gradient(3px_3px_at_40%_60%,rgba(99,102,241,1)_2px,rgba(99,102,241,0.4)_6px,transparent_0),radial-gradient(2px_2px_at_70%_15%,white_2px,transparent_0),radial-gradient(2px_2px_at_90%_80%,white_2px,transparent_0),radial-gradient(3px_3px_at_25%_85%,rgba(251,191,36,0.9)_2px,transparent_0),radial-gradient(2px_2px_at_55%_35%,white_2px,transparent_0),radial-gradient(3.5px_3.5px_at_85%_50%,rgba(99,102,241,1)_2px,rgba(99,102,241,0.3)_6px,transparent_0)] bg-[length:150px_150px,120px_120px,170px_170px,100px_100px,200px_200px,130px_130px,110px_110px] opacity-95"
	></div>

	<!-- Capa 3: Estrellas grandes de fondo -->
	<div
		class="pointer-events-none fixed inset-0 z-0 animate-drift-slow bg-[radial-gradient(3px_3px_at_10%_20%,white_3px,transparent_0),radial-gradient(4px_4px_at_40%_60%,rgba(251,191,36,0.7)_2px,rgba(251,191,36,0.2)_7px,transparent_0),radial-gradient(3px_3px_at_70%_15%,white_3px,transparent_0)] bg-[length:350px_350px,280px_280px,320px_320px] opacity-60"
	></div>

	<!-- Scan lines -->
	<div
		class="pointer-events-none fixed inset-0 z-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.85)_3px,rgba(0,0,0,0.85)_6px)] opacity-20"
	></div>

	<!-- Líneas laterales doradas -->
	<div class="fixed top-1/2 left-12 z-30 h-32 w-[4px] -translate-y-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(251,191,36,0.95),transparent)]"></div>
	<div class="fixed top-1/2 right-12 z-30 h-32 w-[4px] -translate-y-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(251,191,36,0.95),transparent)]"></div>

	<!-- Esquinas decorativas -->
	<div class="fixed top-8 left-8 z-30 h-8 w-8 animate-[fade-in_0.4s_ease_both,flicker_6s_ease-in-out_infinite_0.8s] border-t-[3px] border-l-[3px] border-interactive/80"></div>
	<div class="fixed top-8 right-8 z-30 h-8 w-8 animate-[fade-in_0.4s_ease_both,flicker_6s_ease-in-out_infinite_0.8s] border-t-[3px] border-r-[3px] border-interactive/80"></div>
	<div class="fixed bottom-8 left-8 z-30 h-8 w-8 animate-[fade-in_0.4s_ease_both,flicker_6s_ease-in-out_infinite_0.8s] border-b-[3px] border-l-[3px] border-interactive/80"></div>
	<div class="fixed right-8 bottom-8 z-30 h-8 w-8 animate-[fade-in_0.4s_ease_both,flicker_6s_ease-in-out_infinite_0.8s] border-r-[3px] border-b-[3px] border-interactive/80"></div>

	<!-- Titulo -->
	<h1
		class="relative z-20 m-0 animate-zoom-in text-center font-arcade text-[clamp(3rem,10vw,5rem)] tracking-[0.2em] text-[#FBBF24] [text-shadow:0_0_8px_rgba(0,0,0,0.9),0_2px_4px_rgba(0,0,0,0.8),0_0_30px_rgba(251,191,36,0.5),0_0_60px_rgba(251,191,36,0.25)] max-md:text-[3rem] max-md:tracking-[0.15em]"
	>
		STAR FOX 3
	</h1>

	<!-- Botón Jugar -->
	<div class="relative z-20 flex animate-drop-in flex-col items-center gap-4" style="animation-delay: 0.3s">
		<button
			class="group flex h-[100px] w-[100px] animate-pulse-glow cursor-pointer items-center justify-center rounded-full border-[3px] border-[#FBBF24] bg-[radial-gradient(circle_at_40%_35%,rgba(251,191,36,0.25),rgba(79,70,229,0.4)_70%,rgba(30,30,47,0.8))] transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-110 hover:shadow-arcade-lg focus-visible:outline-[4px] focus-visible:outline-offset-[6px] focus-visible:outline-[#FBBF24] active:scale-95 max-md:h-[80px] max-md:w-[80px]"
			aria-label="Iniciar misión"
			onclick={onPlay}
		>
			<svg class="ml-1 h-10 w-10 text-[#FBBF24] transition-transform duration-200 group-hover:scale-110 max-md:h-8 max-md:w-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M8 5v14l11-7z" />
			</svg>
		</button>
		<span class="animate-float font-sans text-base tracking-[0.15em] text-[#94A3B8] [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] max-md:text-[0.85rem]">INICIAR MISIÓN</span>
	</div>
</div>

<Modal open={showNameModal} onClose={onNameModalClose} />
<GoalModal open={showGoalModal} onClose={() => { showGoalModal = false; goto('/map'); }} />
