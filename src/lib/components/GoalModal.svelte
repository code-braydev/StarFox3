<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { playClick, playBlackHole } from '$lib/audio/audio';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	let selectedGoal = $state('');
	let isWarping = $state(false);

	const goals = [
		{ value: 'dominate', emoji: '🏆', label: 'Dominar', desc: '¡A por las 3 estrellas!', color: '#FBBF24', btnFrom: '#FBBF24', btnTo: '#f59e0b', glow: 'rgba(251,191,36,0.4)' },
		{ value: 'train', emoji: '🎯', label: 'Entrenar', desc: 'Repite y afianza', color: '#3b82f6', btnFrom: '#3b82f6', btnTo: '#2563eb', glow: 'rgba(59,130,246,0.4)' },
		{ value: 'explore', emoji: '🌟', label: 'Explorar', desc: 'Descubre a tu ritmo', color: '#22c55e', btnFrom: '#22c55e', btnTo: '#16a34a', glow: 'rgba(34,197,94,0.4)' }
	];

	let selectedColors = $derived(goals.find(g => g.value === selectedGoal) ?? goals[0]);

	function handleAccept() {
		if (!selectedGoal || isWarping) return;
		isWarping = true;
		if (game.soundEnabled) playBlackHole();
		game.setGoal(selectedGoal);
		setTimeout(() => onClose(), 1200);
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-colors duration-500 {isWarping ? 'bg-black' : 'bg-black/80'}"
		role="dialog"
		aria-modal="true"
		aria-label="Seleccionar meta"
	>
		<div
			class="w-full max-w-[400px] rounded-3xl border-[3px] bg-gradient-to-br from-[#252540] to-[#1a1a3e] p-8 text-center transition-colors duration-300"
			class:animate-scale-in={!isWarping}
			class:animate-black-hole={isWarping}
			style:border-color={selectedColors.color}
		>
			<!-- Avatar -->
			<div class="mb-4 animate-[float_3s_ease-in-out_infinite]">
				<img src="/img/avartar-foxy.webp" alt="Foxy" class="mx-auto h-20 w-20 object-contain" />
			</div>

			<!-- Titulo -->
			<h2 class="mb-2 text-[1.6rem] font-bold text-white max-md:text-[1.4rem]">
				¡Elige tu meta, Piloto!
			</h2>
			<p class="mb-6 text-[1rem] text-[#94A3B8]">
				¿Cómo quieres jugar hoy?
			</p>

			<!-- Goal buttons -->
			<div class="mb-6 flex justify-center gap-3">
				{#each goals as goal}
					<button
						class="flex flex-1 flex-col items-center gap-1.5 rounded-2xl border-[3px] border-[#6366f1] bg-[#1E1E2F] px-4 py-4 text-white transition-all duration-300 hover:scale-105 cursor-pointer data-[selected=true]:bg-[#252540]"
						style:border-color={selectedGoal === goal.value ? goal.color : undefined}
						style:box-shadow={selectedGoal === goal.value ? `0 0 14px ${goal.glow}` : undefined}
						data-selected={selectedGoal === goal.value}
						onclick={() => { selectedGoal = goal.value; if (game.soundEnabled) playClick(); }}
					>
						<span class="text-3xl">{goal.emoji}</span>
						<span class="text-[0.85rem] font-bold">{goal.label}</span>
						<span class="text-[0.7rem] text-[#94A3B8]">{goal.desc}</span>
					</button>
				{/each}
			</div>

			<!-- Accept -->
			<button
				class="min-h-[56px] w-full cursor-pointer rounded-2xl border-none px-8 py-4 text-[1rem] font-bold text-[#1E1E2F] transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
				style:background="linear-gradient(135deg, {selectedColors.btnFrom}, {selectedColors.btnTo})"
				style:box-shadow="0 4px 15px {selectedColors.glow}"
				disabled={!selectedGoal || isWarping}
				onclick={handleAccept}
			>
				¡A despegar! 🚀
			</button>
		</div>
	</div>
{/if}
