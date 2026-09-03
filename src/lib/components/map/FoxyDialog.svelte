<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import avartarFoxy from '$lib/assets/icons/fox.svg';

	let { message, visible = true }: {
		message?: string;
		visible?: boolean;
	} = $props();

	let dialogMessage = $derived(message ?? getAutoMessage());

	function getAutoMessage(): string {
		const completed = game.progress.tablesCompleted.length;
		const total = 8;
		const name = game.player.name || 'Piloto';

		if (completed === 0) {
			return `¡Bienvenido al mapa estelar, ${name}! Elige un planeta para comenzar tu misión.`;
		} else if (completed === total) {
			return `¡Increíble, ${name}! ¡Has completado todas las tablas! Eres un maestro de las matemáticas.`;
		} else if (completed <= 3) {
			return `¡Buen comienzo, ${name}! Has completado ${completed} de ${total} tablas. ¡Sigue así!`;
		} else if (completed <= 6) {
			return `¡Excelente progreso, ${name}! Ya llevas ${completed} tablas. ¡La victoria está cerca!`;
		} else {
			return `¡Casi lo logras, ${name}! Solo te faltan ${total - completed} tablas. ¡Tú puedes!`;
		}
	}
</script>

{#if visible}
	<div class="flex items-start gap-3 animate-fade-in-up">
		<!-- Avatar de Foxy -->
		<div class="flex-shrink-0">
			<img src={avartarFoxy} alt="Foxy" class="h-12 w-12 rounded-full border-2 border-amber-400 bg-[#1E1E2F] p-1" />
		</div>

		<!-- Speech bubble -->
		<div class="relative rounded-2xl border border-amber-400/30 bg-gradient-to-br from-[#252540] to-[#1a1a3e] px-5 py-3 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
			<!-- Flecha del speech bubble -->
			<div class="absolute -left-2 top-4 h-0 w-0 border-t-[6px] border-r-[8px] border-b-[6px] border-t-transparent border-r-[#252540] border-b-transparent"></div>

			<p class="text-[0.85rem] leading-relaxed text-[#94A3B8] max-md:text-[0.8rem]">
				{dialogMessage}
			</p>
		</div>
	</div>
{/if}
