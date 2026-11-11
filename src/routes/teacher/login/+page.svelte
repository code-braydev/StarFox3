<script lang="ts">
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';

	let email = $state('');
	let password = $state('');
	let showResend = $state(false);
	let resendEmail = $state('');
	let resendPassword = $state('');
	let resendMsg = $state('');

	$effect(() => {
		if (session.ready && session.isTeacher) {
			goto('/teacher');
		}
	});

	async function handleLogin() {
		if (!email || !password) return;
		const result = await session.teacherLogin(email, password);
		if (result.ok) {
			goto('/teacher');
		} else if ('needsVerification' in result && result.needsVerification) {
			showResend = true;
			resendEmail = email;
		}
	}

	async function handleResend() {
		if (!resendEmail || !resendPassword) return;
		const result = await session.resendVerification(resendEmail, resendPassword);
		if (result.ok) {
			resendMsg = 'Correo de verificación reenviado. Revisa tu bandeja.';
		}
	}
</script>

<svelte:head>
	<title>Iniciar sesión — Star Fox 3</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center bg-[#0f0f2a] px-4">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="font-arcade text-lg tracking-wider text-[#FBBF24]">STAR FOX 3</h1>
			<p class="mt-2 text-sm text-gray-400">Panel del Profesor</p>
		</div>

		<div class="rounded-3xl border border-amber-400/30 bg-[#252540] p-8">
			<h2 class="mb-6 text-center text-xl font-bold text-white">Iniciar Sesión</h2>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleLogin();
				}}
				class="space-y-4"
			>
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
						class="w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-3 text-white outline-none transition-colors focus:border-amber-400"
						placeholder="••••••••"
					/>
				</div>

				{#if session.error}
					<p class="text-sm text-red-400">{session.error}</p>
				{/if}

				<button
					type="submit"
					disabled={session.loading || !email || !password}
					class="w-full cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#1E1E2F] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{session.loading ? 'Entrando...' : 'Entrar'}
				</button>
			</form>

			{#if showResend}
				<div class="mt-6 border-t border-gray-700 pt-6">
					<h3 class="mb-2 text-sm font-bold text-amber-400">Email no verificado</h3>
					<p class="mb-4 text-xs text-gray-400">
						Necesitas verificar tu email antes de entrar. ¿No recibiste el correo?
					</p>
					{#if resendMsg}
						<p class="mb-3 text-sm text-emerald-400">{resendMsg}</p>
					{/if}
					<input
						type="password"
						bind:value={resendPassword}
						class="mb-3 w-full rounded-xl border border-gray-600 bg-[#1E1E2F] px-4 py-2 text-sm text-white outline-none focus:border-amber-400"
						placeholder="Confirma tu contraseña para reenviar"
					/>
					<button
						class="w-full cursor-pointer rounded-xl border border-amber-400/50 px-4 py-2 text-sm text-amber-400 transition-all hover:bg-amber-400/10"
						onclick={handleResend}
					>
						Reenviar correo de verificación
					</button>
				</div>
			{/if}

			<div class="mt-6 text-center">
				<p class="text-sm text-gray-400">
					¿No tienes cuenta?
					<a href="/teacher/register" class="text-amber-400 hover:underline">Regístrate aquí</a>
				</p>
			</div>
		</div>
	</div>
</div>
