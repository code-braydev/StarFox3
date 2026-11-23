<script lang="ts">
	import { game } from '$lib/stores/game.svelte';
	import { playClick } from '$lib/audio/audio';
	import { characters, getCharacterHead } from '$lib/constants/characters';

	let { open, onClose }: { open: boolean; onClose: () => void } = $props();

	let name = $state('');
	let selectedAvatar = $state('foxy');

	const freeCharacters = characters.filter((c) => c.unlockType === 'free');

	let selectedChar = $derived(characters.find((c) => c.id === selectedAvatar));
	let nameTooShort = $derived(name.length > 0 && name.trim().length < 3);

	let accentColor = $derived('#FBBF24');
	let btnGradient = $derived('linear-gradient(135deg, #FBBF24, #f59e0b)');
	let glowColor = $derived('rgba(251,191,36,0.4)');

	function handleConfirm() {
		const trimmed = name.trim();
		if (trimmed.length < 3) return;
		if (game.soundEnabled) playClick();
		if (['admin', 'maestro', 'master', 'test'].includes(trimmed.toLowerCase())) {
			game.activateMasterProfile(trimmed.toUpperCase());
		} else {
			game.setPlayer(trimmed, selectedAvatar);
		}
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
			style:border-color={accentColor}
		>
			<!-- Avatar del personaje seleccionado -->
			<div class="mb-4 animate-[float_3s_ease-in-out_infinite]">
				<div
					class="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400 bg-[#1E1E2F] p-1 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
				>
					<img
						src={getCharacterHead(selectedAvatar)}
						alt={selectedChar?.name ?? 'Avatar'}
						class="h-full w-full rounded-full object-cover"
					/>
				</div>
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
					bind:value={name}
					onkeydown={handleKeydown}
				/>
			</div>

			<!-- Mensaje de validacion -->
			<p class="mb-5 h-5 text-[0.8rem] text-[#e0d23a]">
				{nameTooShort ? 'Mínimo 3 caracteres' : ''}
			</p>

			<!-- Selector de personaje -->
			<div class="mb-6">
				<p class="mb-3 text-[0.8rem] font-bold tracking-wider text-[#94A3B8] uppercase">
					Elige tu personaje
				</p>
				<div class="flex justify-center gap-3">
					{#each freeCharacters as char (char.id)}
						<button
							class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[3px] border-[#6366f1] bg-[#1E1E2F] px-4 py-3 transition-all duration-300 hover:scale-105 data-[selected=true]:bg-[#252540]"
							style:border-color={selectedAvatar === char.id ? accentColor : undefined}
							style:box-shadow={selectedAvatar === char.id ? `0 0 12px ${glowColor}` : undefined}
							data-selected={selectedAvatar === char.id}
							onclick={() => {
								selectedAvatar = char.id;
								if (game.soundEnabled) playClick();
							}}
						>
							<div class="h-14 w-14 overflow-hidden rounded-full border border-amber-400/40 bg-[#0f0f2a] p-0.5">
								<img
									src={getCharacterHead(char.id)}
									alt={char.name}
									class="h-full w-full rounded-full object-cover"
								/>
							</div>
							<span class="text-[0.8rem] font-bold text-white">{char.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Boton confirmar -->
			<button
				class="min-h-[56px] w-full cursor-pointer rounded-2xl border-none px-8 py-4 text-[1rem] font-bold text-[#1E1E2F] transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
				style:background={btnGradient}
				style:box-shadow="0 4px 15px {glowColor}"
				disabled={name.trim().length < 3}
				onclick={handleConfirm}
			>
				¡Listo! 🚀
			</button>
		</div>
	</div>
{/if}
