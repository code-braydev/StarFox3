import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
	const trimmed = line.trim();
	if (!trimmed || trimmed.startsWith('#')) continue;
	const eqIndex = trimmed.indexOf('=');
	if (eqIndex === -1) continue;
	const key = trimmed.slice(0, eqIndex).trim();
	let val = trimmed.slice(eqIndex + 1).trim();
	if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
	val = val.replace(/\\n/g, '\n');
	envVars[key] = val;
}

const app = initializeApp({
	credential: cert({
		projectId: envVars.FIREBASE_PROJECT_ID,
		clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
		privateKey: envVars.FIREBASE_PRIVATE_KEY
	})
});

try {
	const auth = getAuth(app);
	const list = await auth.listUsers(1);
	console.log('STATUS:AUTH_READY. Users found:', list.users.length);
} catch (e) {
	console.log('STATUS:AUTH_ERROR.', e.code ?? '', e.message);
}
