<script lang="ts">
	let {
		message,
		mood = 'idle'
	}: {
		message: string;
		mood?: 'idle' | 'celebrate' | 'hint' | 'encourage';
	} = $props();
</script>

<div class="flex flex-col items-center gap-3">
	<!-- Monitor frame -->
	<div
		class="relative rounded-2xl border-[3px] border-amber-400/60 bg-gradient-to-b from-[#1a1a3e] to-[#0f0f2a] p-4 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
	>
		<!-- Screen glow -->
		<div class="absolute inset-0 rounded-2xl bg-cyan-500/5"></div>

		<!-- Avatar de Foxy -->
		<div
			class="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400/50 bg-[#252540] max-md:h-16 max-md:w-16
				{mood === 'celebrate'
				? 'animate-bounce'
				: mood === 'hint'
					? 'animate-[tilt_1s_ease-in-out_infinite]'
					: 'animate-[float-spaceship_3s_ease-in-out_infinite]'}"
		>
			<img
				src="/img/avatar-foxy.webp"
				alt="Foxy"
				class="h-14 w-14 rounded-full max-md:h-11 max-md:w-11"
			/>

			<!-- Mood indicator -->
			{#if mood === 'celebrate'}
				<div class="absolute -top-1 -right-1 text-lg">✨</div>
			{:else if mood === 'hint'}
				<div class="absolute -top-1 -right-1 text-lg">💡</div>
			{:else if mood === 'encourage'}
				<div class="absolute -top-1 -right-1 text-lg">💪</div>
			{/if}
		</div>

		<!-- Speech bubble -->
		<div class="relative">
			<div
				class="rounded-xl bg-[#252540] px-4 py-3 text-center text-[0.8rem] leading-relaxed text-[#94A3B8] shadow-inner max-md:text-[0.7rem] max-md:leading-snug"
			>
				{message}
			</div>

			<!-- Arrow pointing up -->
			<div
				class="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-r-[6px] border-b-[8px] border-l-[6px] border-r-transparent border-b-[#252540] border-l-transparent"
			></div>
		</div>
	</div>

	<!-- Monitor stand -->
	<div class="h-2 w-16 rounded-b-lg bg-gradient-to-b from-gray-600 to-gray-700"></div>
	<div class="h-1 w-24 rounded-b-lg bg-gradient-to-b from-gray-700 to-gray-800"></div>
</div>

<style>
	@keyframes tilt {
		0%,
		100% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(3deg);
		}
	}
</style>
