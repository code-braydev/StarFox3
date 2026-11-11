<script lang="ts">
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let registered = $state(false);

	let passwordMismatch = $derived(password !== confirmPassword && confirmPassword.length > 0);
	let passwordTooShort = $derived(password.length > 0 && password.length < 6);

	async function handleRegister() {
		if (!name || !email || !password || passwordMismatch || passwordTooShort) return;
		const result = await session.teacherRegister(email, password, name);
		if (result.ok) {
			registered = true;
		}
	}
</script>

<svelte:head>
	<title>Registro — Star Fox 3</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center bg-[#0f0f2a] px-4">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="font-arcade text-lg tracking-wider text-[#FBBF24]">STAR FOX 3</h1>
			<p class="mt-2 text-sm text-gray-400">Registro de Profesor</p>
		</div>

		{#if registered}
			<div class="rounded-3xl border border-emerald-400/30 bg-[#252540] p-8 text-center">
				<div class="mb-4 text-5xl">📧</div>
				<h2 class="mb-2 text-xl font-bold text-white">¡Cuenta creada!</h2>
				<p class="mb-6 text-sm text-gray-400">
					Hemos enviado un enlace de verificación a
					<strong class="text-amber-400">{email}</strong>.
					Haz clic en el enlace para activar tu cuenta y luego vuelve aquí para iniciar sesión.
				</p>
				<button
					class="w-full cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105"
					onclick={() => goto('/teacher/login')}
				>
					Ir a iniciar sesión
				</button>
			</div>
		{:else}
			<div class="rounded-3xl border border-amber-400/30 bg-[#252540] p-8">
				<h2 class="mb-6 text-center text-xl font-bold text-white">Crear Cuenta</h2>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleRegister();
					}}
					class="space-y-4"
				>
					<div>
						<label for="name" class="mb-1 block text-sm text-gray-300">Nombre completo</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							minlength="3"
							class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none transition-colors focus:border-amber-400"
							placeholder="Prof. Juan Pérez"
						/>
					</div>
					<div>
						<label for="email" class="mb-1 block text-sm text-gray-300">Email</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none transition-colors focus:border-amber-400"
							placeholder="tu@email.com"
						/>
					</div>
					<div>
						<label for="password" class="mb-1 block text-sm text-gray-300">Contraseña</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							required
							minlength="6"
							class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none transition-colors focus:border-amber-400"
							placeholder="Mínimo 6 caracteres"
						/>
						{#if passwordTooShort}
							<p class="mt-1 text-xs text-red-400">Mínimo 6 caracteres</p>
						{/if}
					</div>
					<div>
						<label for="confirmPassword" class="mb-1 block text-sm text-gray-300">Confirmar contraseña</label>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							required
							class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none transition-colors focus:border-amber-400 {passwordMismatch
								? 'border-red-400'
								: ''}"
							placeholder="Repite tu contraseña"
						/>
						{#if passwordMismatch}
							<p class="mt-1 text-xs text-red-400">Las contraseñas no coinciden</p>
						{/if}
					</div>

					{#if session.error}
						<p class="text-sm text-red-400">{session.error}</p>
					{/if}

					<button
						type="submit"
						disabled={session.loading || !name || !email || !password || passwordMismatch || passwordTooShort}
						class="w-full cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{session.loading ? 'Creando cuenta...' : 'Crear cuenta'}
					</button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-sm text-gray-400">
						¿Ya tienes cuenta?
						<a href="/teacher/login" class="text-amber-400 hover:underline">Inicia sesión</a>
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
