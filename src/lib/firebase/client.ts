import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { env } from '$env/dynamic/public';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function readPublicEnv(key: string): string {
	return (
		(env as Record<string, string | undefined>)[key] ||
		((import.meta.env as Record<string, string | undefined>)[key] ?? '')
	).trim();
}

/**
 * Valida si las variables públicas de Firebase están configuradas con valores reales.
 */
export function isFirebaseClientConfigured(): boolean {
	const apiKey = readPublicEnv('PUBLIC_FIREBASE_API_KEY');
	const projectId = readPublicEnv('PUBLIC_FIREBASE_PROJECT_ID');
	return Boolean(
		apiKey &&
		apiKey !== 'tu_api_key' &&
		apiKey.length > 5 &&
		projectId &&
		projectId !== 'tu-proyecto'
	);
}

export function getConfig() {
	return {
		apiKey: readPublicEnv('PUBLIC_FIREBASE_API_KEY'),
		authDomain: readPublicEnv('PUBLIC_FIREBASE_AUTH_DOMAIN'),
		projectId: readPublicEnv('PUBLIC_FIREBASE_PROJECT_ID'),
		appId: readPublicEnv('PUBLIC_FIREBASE_APP_ID'),
		storageBucket: readPublicEnv('PUBLIC_FIREBASE_STORAGE_BUCKET'),
		messagingSenderId: readPublicEnv('PUBLIC_FIREBASE_MESSAGING_SENDER_ID')
	};
}

/** Inicializa Firebase Client de forma diferida (solo en el navegador). */
export function getFirebaseApp(): FirebaseApp {
	if (app) return app;
	const existing = getApps();
	app = existing.length > 0 ? existing[0] : initializeApp(getConfig());
	return app;
}

export function getFirebaseAuth(): Auth {
	if (auth) return auth;
	auth = getAuth(getFirebaseApp());
	auth.languageCode = 'es';
	return auth;
}
