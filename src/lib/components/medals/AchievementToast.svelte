<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { getMedalById } from '$lib/constants/medals';
	import { playStar, playClick } from '$lib/audio/audio';

	let currentMedalId = $derived(game.currentPendingMedal);
	let medal = $derived(currentMedalId ? getMedalById(currentMedalId) : null);
	let dismissTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (medal) {
			if (game.soundEnabled) playStar();
			if (dismissTimer) clearTimeout(dismissTimer);
			dismissTimer = setTimeout(() => {
				handleDismiss();
			}, 4500);
		}
		return () => {
			if (dismissTimer) clearTimeout(dismissTimer);
		};
	});

	function handleDismiss() {
		if (dismissTimer) clearTimeout(dismissTimer);
		game.dismissPendingMedal();
	}
</script>

{#if medal}
	<div
		class="fixed top-5 left-1/2 z-[9999] flex w-[90%] max-w-md -translate-x-1/2 animate-drop-in items-center gap-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-[#1e1e38] via-[#2a2a4e] to-[#1e1e38] p-4 shadow-[0_0_30px_rgba(251,191,36,0.6)] backdrop-blur-md"
		role="alert"
	>
		<!-- Icono o Medalla -->
		<!-- RECURSO: static/img/medals/{medal.id}.png - Por ahora usamos fallback con emoji -->
		<div
			class="flex h-14 w-14 flex-shrink-0 animate-bounce items-center justify-center rounded-xl border border-amber-300/40 bg-amber-400/20 text-3xl shadow-[0_0_15px_rgba(251,191,36,0.4)]"
		>
			<span>{medal.icon}</span>
		</div>

		<!-- Texto del Logro -->
		<div class="flex-1">
			<div class="flex items-center gap-1.5">
				<span class="font-arcade text-[0.6rem] tracking-wider text-amber-400">
					🏆 ¡LOGRO DESBLOQUEADO!
				</span>
			</div>
			<h4 class="font-arcade text-xs font-bold text-white max-md:text-[0.65rem]">
				{medal.name}
			</h4>
			<p class="mt-0.5 text-[0.7rem] text-gray-300 max-md:text-[0.6rem]">
				{medal.description}
			</p>
		</div>

		<!-- Botón Cerrar -->
		<button
			class="cursor-pointer text-gray-400 hover:text-white"
			onclick={() => {
				if (game.soundEnabled) playClick();
				handleDismiss();
			}}
			aria-label="Cerrar notificación"
		>
			✕
		</button>
	</div>
{/if}
