<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';
	import maleIcon from '$lib/assets/icons/male.svg';
	import femaleIcon from '$lib/assets/icons/female.svg';
	import foxIcon from '$lib/assets/icons/fox.svg';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	let name = $state('');
	let selectedGender = $state<'boy' | 'girl' | 'neutral'>('neutral');

	const genders = [
		{ value: 'boy' as const, icon: maleIcon, label: 'Niño' },
		{ value: 'girl' as const, icon: femaleIcon, label: 'Niña' },
		{ value: 'neutral' as const, icon: foxIcon, label: 'Comandante' }
	];

	const colorMap = {
		boy: { accent: '#3b82f6', btnFrom: '#3b82f6', btnTo: '#2563eb', glow: 'rgba(59,130,246,0.4)' },
		girl: { accent: '#ec4899', btnFrom: '#ec4899', btnTo: '#db2777', glow: 'rgba(236,72,153,0.4)' },
		neutral: {
			accent: '#FBBF24',
			btnFrom: '#FBBF24',
			btnTo: '#f59e0b',
			glow: 'rgba(251,191,36,0.4)'
		}
	};

	let colors = $derived(colorMap[selectedGender]);
	let nameTooShort = $derived(name.length > 0 && name.trim().length < 3);

	function handleConfirm() {
		if (name.trim().length < 3) return;
		if (game.soundEnabled) playClick();
		game.setPlayer(name.trim(), selectedGender);
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleConfirm();
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[1000] flex animate-fade-in items-center justify-center bg-black/80 p-4"
		role="dialog"
		aria-modal="true"
		aria-label="Registro de piloto"
	>
		<div
			class="w-full max-w-[420px] animate-scale-in rounded-3xl border-[3px] bg-gradient-to-br from-[#252540] to-[#1a1a3e] p-8 text-center transition-colors duration-300"
			style:border-color={colors.accent}
		>
			<!-- Avatar -->
			<div class="mb-4 animate-[float_3s_ease-in-out_infinite]">
				<img src="/img/avartar-foxy.webp" alt="Foxy" class="mx-auto h-20 w-20 object-contain" />
			</div>

			<!-- Titulo -->
			<h2 class="mb-2 text-[1.6rem] font-bold text-white max-md:text-[1.4rem]">
				¡Bienvenido, Piloto!
			</h2>
			<p class="mb-6 text-[1rem] text-[#94A3B8]">
				¿Cómo te llamas? Elige tu personaje y prepárate para la misión.
			</p>

			<!-- Input nombre -->
			<div class="mb-2">
				<input
					type="text"
					placeholder="Tu nombre de piloto..."
					maxlength={20}
					class="w-full rounded-xl border-[2px] bg-[#1E1E2F] px-4 py-3 text-[1rem] text-white placeholder-[#94A3B8]/60 transition-colors duration-200 outline-none"
					style:border-color={nameTooShort ? '#e0d23a' : 'rgba(99,102,241,0.5)'}
					style:--tw-ring-color={colors.accent}
					bind:value={name}
					onkeydown={handleKeydown}
				/>
			</div>

			<!-- Mensaje de validacion -->
			<p class="mb-5 h-5 text-[0.8rem] text-[#e0d23a]">
				{nameTooShort ? 'Mínimo 3 caracteres' : ''}
			</p>

			<!-- Selector de genero -->
			<div class="mb-6">
				<p class="mb-3 text-[0.8rem] font-bold tracking-wider text-[#94A3B8] uppercase">
					Elige tu personaje
				</p>
				<div class="flex justify-center gap-3">
					{#each genders as g}
						<button
							class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[3px] border-[#6366f1] bg-[#1E1E2F] px-5 py-4 transition-all duration-300 hover:scale-105 data-[selected=true]:bg-[#252540]"
							style:border-color={selectedGender === g.value ? colors.accent : undefined}
							style:box-shadow={selectedGender === g.value ? `0 0 12px ${colors.glow}` : undefined}
							data-selected={selectedGender === g.value}
							onclick={() => {
								selectedGender = g.value;
								if (game.soundEnabled) playClick();
							}}
						>
							<img src={g.icon} alt={g.label} class="h-10 w-10" />
							<span class="text-[0.8rem] font-bold text-white">{g.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Boton confirmar -->
			<button
				class="min-h-[56px] w-full cursor-pointer rounded-2xl border-none px-8 py-4 text-[1rem] font-bold text-[#1E1E2F] transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
				style:background="linear-gradient(135deg, {colors.btnFrom}, {colors.btnTo})"
				style:box-shadow="0 4px 15px {colors.glow}"
				disabled={name.trim().length < 3}
				onclick={handleConfirm}
			>
				¡Listo! 🚀
			</button>
		</div>
	</div>
{/if}
