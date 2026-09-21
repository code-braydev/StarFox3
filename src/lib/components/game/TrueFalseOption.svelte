<script lang="ts">
	import { playClick } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';

	let {
		value,
		correct = false,
		selected = false,
		disabled = false,
		showResult = false,
		revealedWrong = false,
		onclick
	}: {
		value: number;
		correct?: boolean;
		selected?: boolean;
		disabled?: boolean;
		showResult?: boolean;
		revealedWrong?: boolean;
		onclick?: () => void;
	} = $props();

	let isAnimating = $state(false);

	let effectiveVariant = $derived(
		revealedWrong
			? 'wrong'
			: showResult
				? correct
					? 'correct'
					: selected
						? 'wrong'
						: 'dimmed'
				: 'idle'
	);

	function handleClick() {
		if (disabled || showResult) return;
		if (game.soundEnabled) playClick();
		isAnimating = true;
		setTimeout(() => (isAnimating = false), 300);
		onclick?.();
	}
</script>

<button
	class="group relative flex h-28 w-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-[3px] font-arcade text-lg font-bold transition-all duration-300 max-md:h-24 max-md:w-36 max-md:text-base
		{effectiveVariant === 'idle'
		? 'border-gray-600 bg-gradient-to-br from-[#2a2a4a] to-[#1a1a3e] text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95'
		: ''}
		{effectiveVariant === 'correct'
		? 'border-emerald-400 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-[0_0_25px_rgba(34,197,94,0.6)] scale-105'
		: ''}
		{effectiveVariant === 'wrong'
		? 'border-red-400 bg-gradient-to-br from-red-600/50 to-red-800/50 text-red-200 animate-[shake_0.4s_ease-in-out]'
		: ''}
		{effectiveVariant === 'dimmed'
		? 'border-gray-700 bg-[#1a1a2e] text-gray-500 opacity-40 cursor-not-allowed'
		: ''}
		{disabled && effectiveVariant === 'idle' ? 'cursor-not-allowed opacity-60' : ''}
		{isAnimating && effectiveVariant === 'correct'
		? 'animate-[lever-activate_0.3s_cubic-bezier(0.34,1.56,0.64,1)]'
		: ''}
	"
	disabled={disabled || effectiveVariant !== 'idle'}
	onclick={handleClick}
>
	<div
		class="absolute inset-1 rounded-xl border border-dashed transition-all duration-300
			{effectiveVariant === 'idle' ? 'border-gray-600/40 group-hover:border-amber-400/40' : ''}
			{effectiveVariant === 'correct' ? 'border-emerald-300/40' : ''}
			{effectiveVariant === 'wrong' ? 'border-red-300/30' : ''}
		"
	></div>

	<span class="relative z-10 text-xl">
		{value === 1 ? '✅' : '❌'}
	</span>
	<span class="relative z-10 mt-1 text-sm">
		{value === 1 ? 'Verdadero' : 'Falso'}
	</span>

	<div
		class="absolute bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full transition-all duration-300
			{effectiveVariant === 'idle' ? 'bg-gray-600' : ''}
			{effectiveVariant === 'correct' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : ''}
			{effectiveVariant === 'wrong' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : ''}
		"
	></div>
</button>
