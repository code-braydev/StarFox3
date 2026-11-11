import { initializeApp, getApps, cert, type App, type AppOptions } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env } from '$env/dynamic/private';

let app: App | null = null;
let auth: Auth | null = null;
let rawDb: Firestore | null = null;
let scopedDb: Firestore | null = null;
let rootDocInitialized = false;
let warningFilterInstalled = false;

/** Colección raíz en Firestore donde se agrupa toda la data de este proyecto */
export const FIRESTORE_ROOT_COLLECTION = 'startfox3';
export const FIRESTORE_ROOT_DOC = 'app';

function silenceGoogleAuthDeprecationNoise() {
	if (warningFilterInstalled || typeof process === 'undefined') return;
	warningFilterInstalled = true;
	const origWarn = console.warn;
	console.warn = (...args: unknown[]) => {
		const first = typeof args[0] === 'string' ? args[0] : '';
		if (
			first.includes('The `fromJSON` method is deprecated') ||
			first.includes('The `credentials` option is deprecated')
		) {
			return;
		}
		origWarn.apply(console, args);
	};
}

function getEnvVar(
	name: 'FIREBASE_PROJECT_ID' | 'FIREBASE_CLIENT_EMAIL' | 'FIREBASE_PRIVATE_KEY'
): string {
	return (env[name] ?? '').trim();
}

/**
 * Valida si las variables privadas de Firebase Admin están configuradas con valores reales.
 */
export function isFirebaseAdminConfigured(): boolean {
	const projectId = getEnvVar('FIREBASE_PROJECT_ID');
	const clientEmail = getEnvVar('FIREBASE_CLIENT_EMAIL');
	const privateKey = getEnvVar('FIREBASE_PRIVATE_KEY');

	return Boolean(
		projectId &&
		projectId !== 'tu-proyecto' &&
		clientEmail &&
		!clientEmail.includes('xxxx') &&
		privateKey &&
		!privateKey.includes('xxx')
	);
}

function buildOptions(): AppOptions {
	const projectId = getEnvVar('FIREBASE_PROJECT_ID');
	const clientEmail = getEnvVar('FIREBASE_CLIENT_EMAIL');
	let privateKey = getEnvVar('FIREBASE_PRIVATE_KEY');

	if (!projectId || !clientEmail || !privateKey) {
		throw new Error(
			'Faltan variables de entorno para Firebase Admin SDK (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY). Revisa tu archivo .env'
		);
	}

	if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
		privateKey = privateKey.slice(1, -1);
	}
	if (privateKey.includes('\\n')) {
		privateKey = privateKey.replace(/\\n/g, '\n');
	}
	privateKey = privateKey.trim();

	return {
		projectId,
		credential: cert({ projectId, clientEmail, privateKey })
	};
}

/** Inicializa Firebase Admin de forma diferida (solo en el servidor). */
export function getAdminApp(): App {
	silenceGoogleAuthDeprecationNoise();
	if (app) return app;
	const existing = getApps();
	app = existing.length > 0 ? existing[0] : initializeApp(buildOptions());
	return app;
}

export function getAdminAuth(): Auth {
	if (auth) return auth;
	auth = getAuth(getAdminApp());
	return auth;
}

export function getAdminDb(): Firestore {
	if (scopedDb) return scopedDb;
	const firestore = rawDb ?? (rawDb = getFirestore(getAdminApp()));
	const rootDocRef = firestore.collection(FIRESTORE_ROOT_COLLECTION).doc(FIRESTORE_ROOT_DOC);

	if (!rootDocInitialized) {
		rootDocInitialized = true;
		rootDocRef
			.set(
				{
					project: 'Star Fox 3 OVA',
					namespace: FIRESTORE_ROOT_COLLECTION,
					updatedAt: Date.now()
				},
				{ merge: true }
			)
			.catch(() => {});
	}

	scopedDb = new Proxy(firestore, {
		get(target, prop, receiver) {
			if (prop === 'collection') {
				return (collectionPath: string) => {
					if (collectionPath === FIRESTORE_ROOT_COLLECTION) {
						return target.collection(collectionPath);
					}
					return rootDocRef.collection(collectionPath);
				};
			}
			const value = Reflect.get(target, prop, receiver);
			return typeof value === 'function' ? value.bind(target) : value;
		}
	});

	return scopedDb;
}
