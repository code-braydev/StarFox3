<script lang="ts">
	import { goto } from '$app/navigation';

	let code = $state('');
	let error = $state('');

	function handleSubmit() {
		const clean = code.trim().toUpperCase().replace(/\s+/g, '');
		if (clean.length < 4) {
			error = 'Ingresa un código válido de al menos 4 caracteres';
			return;
		}
		goto(`/join/${clean}`);
	}
</script>

<svelte:head>
	<title>Unirse a una clase — Star Fox 3</title>
</svelte:head>

<div class="flex min-h-dvh flex-col items-center justify-center bg-[#0f0f2a] px-4">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="font-arcade text-lg tracking-wider text-[#FBBF24]">STAR FOX 3</h1>
			<p class="mt-2 text-sm text-gray-400">Ingreso de Estudiantes</p>
		</div>

		<div class="rounded-3xl border border-amber-400/30 bg-[#252540] p-8 text-center">
			<div class="mb-4 text-5xl">🚀</div>
			<h2 class="mb-2 text-xl font-bold text-white">Únete a tu Clase</h2>
			<p class="mb-6 text-sm text-gray-400">
				Ingresa el código proporcionado por tu profesor para acceder y registrar tus avances.
			</p>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				class="space-y-4"
			>
				<div>
					<input
						type="text"
						bind:value={code}
						maxlength="12"
						placeholder="CÓDIGO (EJ: AB12CD34)"
						class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-center font-mono text-xl tracking-widest text-amber-400 uppercase outline-none focus:border-amber-400"
					/>
				</div>

				{#if error}
					<p class="text-sm text-red-400">{error}</p>
				{/if}

				<div class="flex gap-3 pt-2">
					<button
						type="button"
						class="flex-1 cursor-pointer rounded-xl border border-gray-600 bg-transparent px-4 py-3 text-sm text-gray-400 transition-all hover:text-white"
						onclick={() => goto('/')}
					>
						Volver
					</button>
					<button
						type="submit"
						class="flex-1 cursor-pointer rounded-xl bg-amber-400 px-4 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105 disabled:opacity-50"
						disabled={!code.trim()}
					>
						Continuar →
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
