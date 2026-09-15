<script lang="ts">
	import { playClick } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';

	let {
		value,
		correct = false,
		selected = false,
		disabled = false,
		variant = undefined,
		onclick
	}: {
		value: number;
		correct?: boolean;
		selected?: boolean;
		disabled?: boolean;
		variant?: 'idle' | 'correct' | 'wrong';
		onclick?: () => void;
	} = $props();

	let isAnimating = $state(false);

	let effectiveVariant = $derived(
		variant ?? (selected && correct ? 'correct' : selected && !correct ? 'wrong' : 'idle')
	);

	function handleClick() {
		if (disabled) return;
		if (game.soundEnabled) playClick();
		isAnimating = true;
		setTimeout(() => (isAnimating = false), 300);
		onclick?.();
	}
</script>

<button
	class="lever group relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-[3px] font-arcade text-2xl font-bold transition-all duration-300 max-md:h-20 max-md:w-20 max-md:text-xl
		{effectiveVariant === 'idle'
		? 'border-gray-600 bg-gradient-to-br from-[#2a2a4a] to-[#1a1a3e] text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]'
		: ''}
		{effectiveVariant === 'correct'
		? 'border-emerald-400 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-[0_0_25px_rgba(34,197,94,0.5)]'
		: ''}
		{effectiveVariant === 'wrong'
		? 'border-red-400 bg-gradient-to-br from-red-600/50 to-red-800/50 text-red-200'
		: ''}
		{disabled ? 'cursor-not-allowed opacity-60' : ''}
		{isAnimating && effectiveVariant === 'correct'
		? 'animate-[lever-activate_0.3s_cubic-bezier(0.34,1.56,0.64,1)]'
		: ''}
		{isAnimating && effectiveVariant === 'wrong' ? 'animate-[shake_0.4s_ease-in-out]' : ''}
	"
	disabled={disabled || effectiveVariant !== 'idle'}
	onclick={handleClick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') handleClick();
	}}
>
	<!-- Borde interno decorativo -->
	<div
		class="absolute inset-1 rounded-xl border border-dashed transition-all duration-300
			{effectiveVariant === 'idle' ? 'border-gray-600/40 group-hover:border-amber-400/40' : ''}
			{effectiveVariant === 'correct' ? 'border-emerald-300/40' : ''}
			{effectiveVariant === 'wrong' ? 'border-red-300/30' : ''}
		"
	></div>

	<!-- Número -->
	<span class="relative z-10">{value}</span>

	<!-- Indicador LED inferior -->
	<div
		class="absolute bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full transition-all duration-300
			{effectiveVariant === 'idle' ? 'bg-gray-600' : ''}
			{effectiveVariant === 'correct' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : ''}
			{effectiveVariant === 'wrong' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : ''}
		"
	></div>

	<!-- Glow hover -->
	{#if effectiveVariant === 'idle' && !disabled}
		<div
			class="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			style="box-shadow: 0 0 30px rgba(251, 191, 36, 0.2);"
		></div>
	{/if}
</button>
