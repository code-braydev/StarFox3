import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInAnonymously,
	createUserWithEmailAndPassword,
	signOut,
	sendEmailVerification,
	reload,
	type User
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseClientConfigured } from '$lib/firebase/client';
import type { StudentSession, SessionState } from './types/session';
import { loadStoredSession, saveStoredSession, clearStoredSession } from './logic/session-storage';

export * from './types/session';

function createSessionStore() {
	const state = $state<SessionState>({
		authUser: null,
		ready: false,
		loading: false,
		error: null,
		teacherSession: null,
		studentSession: null
	});

	// Restaurar sesión persistida del estudiante
	const stored = loadStoredSession();
	if (stored.student) {
		state.studentSession = {
			uid: '',
			classId: stored.student.classId,
			studentId: stored.student.studentId,
			classCode: stored.student.classCode,
			className: stored.student.className,
			displayName: stored.student.displayName
		};
	}

	let initialized = false;

	function init() {
		if (typeof window === 'undefined' || initialized) return;
		initialized = true;

		if (!isFirebaseClientConfigured()) {
			// Modo local / offline sin Firebase configurado
			state.ready = true;
			return;
		}

		try {
			const auth = getFirebaseAuth();
			onAuthStateChanged(
				auth,
				async (user) => {
					state.authUser = user;
					if (user) {
						if (state.studentSession) {
							state.studentSession = { ...state.studentSession, uid: user.uid };
						}
						try {
							let result = await user.getIdTokenResult();
							let claims = result.claims;
							// Si el usuario tiene email (es cuenta de profesor) pero su token en caché aún no tenía el claim 'teacher', refrescar token
							if (!user.isAnonymous && user.email && claims.role !== 'teacher') {
								result = await user.getIdTokenResult(true);
								claims = result.claims;
							}
							if (claims.role === 'teacher' || (!user.isAnonymous && user.email)) {
								state.teacherSession = {
									uid: user.uid,
									email: user.email ?? '',
									name: (claims.name as string) || user.email?.split('@')[0] || 'Comandante',
									emailVerified: user.emailVerified
								};
							} else {
								state.teacherSession = null;
							}
						} catch (err) {
							console.warn('[Session] No se pudieron obtener los claims:', err);
						} finally {
							state.ready = true;
						}
					} else {
						state.teacherSession = null;
						state.ready = true;
					}
				},
				(err) => {
					console.warn('[Session] Error en observador de Auth:', err);
					state.ready = true;
				}
			);
		} catch (err) {
			console.warn('[Session] No se pudo inicializar Firebase Auth:', err);
			state.ready = true;
		}
	}

	function clearError() {
		state.error = null;
	}

	async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
		const user = state.authUser;
		if (!user) {
			throw new Error('No hay sesión activa');
		}
		const idToken = await user.getIdToken();
		const headers = new Headers(init.headers);
		headers.set('authorization', `Bearer ${idToken}`);
		return fetch(url, { ...init, headers });
	}

	// --- Flujo del Profesor ---
	async function teacherRegister(email: string, password: string, name: string) {
		if (!isFirebaseClientConfigured()) {
			state.error = 'Firebase aún no está configurado en las variables de entorno (.env)';
			return { ok: false as const, error: state.error };
		}

		state.loading = true;
		state.error = null;
		try {
			const auth = getFirebaseAuth();
			auth.languageCode = 'es';
			const cred = await createUserWithEmailAndPassword(auth, email, password);
			const idToken = await cred.user.getIdToken();
			const res = await fetch('/api/auth/teacher', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${idToken}`
				},
				body: JSON.stringify({ action: 'register', name })
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(body.error ?? 'Error al registrar');
			}
			// Si el servidor no envió el correo vía Resend (dominio custom), usar el envío nativo de Firebase en español
			if (!body.emailSentByServer) {
				await sendEmailVerification(cred.user);
			}
			await signOut(auth);
			return { ok: true as const };
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Error al registrar';
			return { ok: false as const, error: state.error };
		} finally {
			state.loading = false;
		}
	}

	async function teacherLogin(email: string, password: string) {
		if (!isFirebaseClientConfigured()) {
			state.error = 'Firebase aún no está configurado en las variables de entorno (.env)';
			return { ok: false as const, error: state.error };
		}

		state.loading = true;
		state.error = null;
		try {
			const auth = getFirebaseAuth();
			auth.languageCode = 'es';
			const cred = await signInWithEmailAndPassword(auth, email, password);
			await reload(cred.user);
			if (!cred.user.emailVerified) {
				state.error = 'Debes verificar tu email antes de continuar. Revisa tu correo.';
				return { ok: false as const, needsVerification: true, email };
			}
			const idToken = await cred.user.getIdToken(true);
			const res = await fetch('/api/auth/teacher', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${idToken}`
				},
				body: JSON.stringify({ action: 'login' })
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(body.error ?? 'Error al iniciar sesión');
			}
			// Refrescar el token para traer el custom claim 'teacher' recién asegurado y poblar teacherSession antes de navegar
			const tokenResult = await cred.user.getIdTokenResult(true);
			state.authUser = cred.user;
			state.teacherSession = {
				uid: cred.user.uid,
				email: cred.user.email ?? email,
				name:
					(body.name as string) ||
					(tokenResult.claims.name as string) ||
					cred.user.email?.split('@')[0] ||
					'Comandante',
				emailVerified: cred.user.emailVerified
			};
			state.ready = true;
			return { ok: true as const };
		} catch (e) {
			if (e instanceof Error && 'code' in e) {
				const code = (e as { code: string }).code;
				if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
					state.error = 'Email o contraseña incorrectos';
				} else if (code === 'auth/too-many-requests') {
					state.error = 'Demasiados intentos. Intenta más tarde.';
				} else {
					state.error = e.message;
				}
			} else {
				state.error = e instanceof Error ? e.message : 'Error al iniciar sesión';
			}
			return { ok: false as const, error: state.error };
		} finally {
			state.loading = false;
		}
	}

	async function resendVerification(email: string, password: string) {
		if (!isFirebaseClientConfigured()) {
			state.error = 'Firebase no está configurado.';
			return { ok: false as const, error: state.error };
		}

		state.loading = true;
		state.error = null;
		try {
			const auth = getFirebaseAuth();
			auth.languageCode = 'es';
			const cred = await signInWithEmailAndPassword(auth, email, password);
			const idToken = await cred.user.getIdToken();
			const res = await fetch('/api/auth/teacher', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${idToken}`
				},
				body: JSON.stringify({ action: 'resend_verification' })
			});
			const body = await res.json().catch(() => ({}));
			if (!body.emailSentByServer) {
				await sendEmailVerification(cred.user);
			}
			await signOut(auth);
			return { ok: true as const };
		} catch {
			state.error = 'No se pudo reenviar el correo. Verifica tus datos.';
			return { ok: false as const, error: state.error };
		} finally {
			state.loading = false;
		}
	}

	async function teacherLogout() {
		if (isFirebaseClientConfigured()) {
			await signOut(getFirebaseAuth());
		}
		state.teacherSession = null;
	}

	// --- Flujo del Estudiante ---
	async function studentEnsureAuth(): Promise<User> {
		const auth = getFirebaseAuth();
		if (auth.currentUser) return auth.currentUser;
		const cred = await signInAnonymously(auth);
		return cred.user;
	}

	async function studentJoin(code: string, pin: string, studentId: string) {
		if (!isFirebaseClientConfigured()) {
			state.error = 'Firebase aún no está configurado en el proyecto';
			return { ok: false as const, error: state.error };
		}

		state.loading = true;
		state.error = null;
		try {
			const user = await studentEnsureAuth();
			const idToken = await user.getIdToken();
			const res = await fetch('/api/join', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${idToken}`
				},
				body: JSON.stringify({ action: 'bind', code, pin, studentId })
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				state.error = body.error ?? 'Error al unirse a la clase';
				return { ok: false as const, error: state.error };
			}
			// Forzar refresco del token para que incluya los nuevos custom claims (studentId, classId, teacherId)
			await user.getIdToken(true);

			const s: StudentSession = {
				uid: user.uid,
				classId: body.classId,
				studentId: body.studentId,
				classCode: code.toUpperCase(),
				className: body.className,
				displayName: body.displayName
			};
			state.studentSession = s;
			saveStoredSession({
				student: {
					classId: s.classId,
					studentId: s.studentId,
					classCode: s.classCode,
					className: s.className,
					displayName: s.displayName
				}
			});
			return {
				ok: true as const,
				classId: body.classId,
				studentId: body.studentId,
				className: body.className,
				displayName: body.displayName,
				summary: body.summary ?? null
			};
		} catch (e) {
			state.error = e instanceof Error ? e.message : 'Error al unirse';
			return { ok: false as const, error: state.error };
		} finally {
			state.loading = false;
		}
	}

	function studentLeave() {
		state.studentSession = null;
		clearStoredSession();
	}

	return {
		// --- Estado reactivo ---
		get authUser() { return state.authUser; },
		get ready() { return state.ready; },
		get loading() { return state.loading; },
		get error() { return state.error; },
		get teacherSession() { return state.teacherSession; },
		get studentSession() { return state.studentSession; },

		// --- Derivados de autorización ---
		get isTeacher() {
			return state.teacherSession !== null && state.teacherSession.emailVerified;
		},
		get isTeacherPendingVerification() {
			return state.teacherSession !== null && !state.teacherSession.emailVerified;
		},
		get isStudent() {
			return state.studentSession !== null;
		},

		// --- Métodos ---
		init,
		clearError,
		authFetch,
		teacherRegister,
		teacherLogin,
		teacherLogout,
		resendVerification,
		studentEnsureAuth,
		studentJoin,
		studentLeave
	};
}

export const session = createSessionStore();
