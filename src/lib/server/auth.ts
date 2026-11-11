import type { RequestEvent } from '@sveltejs/kit';
import { getAdminAuth, getAdminDb, isFirebaseAdminConfigured } from './firebase-admin';
import { AuthError, authErrorResponse } from './http';

export { AuthError, authErrorResponse };

export interface AuthenticatedStudent {
	uid: string;
	studentId: string;
	classId: string;
	teacherId: string;
}

/**
 * Extrae y valida un token de Firebase ID del header Authorization.
 */
export async function verifyIdToken(event: RequestEvent) {
	if (!isFirebaseAdminConfigured()) {
		return null;
	}
	const header = event.request.headers.get('authorization');
	if (!header?.startsWith('Bearer ')) return null;
	const token = header.slice(7);
	try {
		return await getAdminAuth().verifyIdToken(token);
	} catch {
		return null;
	}
}

/** Obtiene el usuario autenticado actual o lanza un error 401/503. */
export async function requireUser(event: RequestEvent) {
	if (!isFirebaseAdminConfigured()) {
		throw new AuthError('Firebase Admin no está configurado en el servidor', 503);
	}
	const decoded = await verifyIdToken(event);
	if (!decoded) {
		throw new AuthError('No autenticado', 401);
	}
	return decoded;
}

/** Requiere un usuario con rol 'teacher'. */
export async function requireTeacher(event: RequestEvent) {
	const decoded = await requireUser(event);
	if (decoded.role === 'teacher') {
		return decoded;
	}
	// Fallback para cuentas docentes con email verificado cuyo token aún no refrescó el custom claim
	if (decoded.email && decoded.firebase?.sign_in_provider !== 'anonymous') {
		await getAdminAuth()
			.setCustomUserClaims(decoded.uid, {
				role: 'teacher',
				name: (decoded.name as string) || decoded.email.split('@')[0] || 'Comandante'
			})
			.catch(() => {});
		return decoded;
	}
	throw new AuthError('Se requiere cuenta de profesor', 403);
}

/**
 * Requiere un alumno vinculado a una clase.
 * Lee studentId, classId y teacherId desde los custom claims (0 lecturas a Firestore).
 * Si el token aún no tenía claims actualizados, hace fallback por authUid y fija los claims.
 */
export async function requireStudent(event: RequestEvent): Promise<AuthenticatedStudent> {
	const decoded = await requireUser(event);
	if (decoded.role === 'teacher') {
		throw new AuthError('Los profesores no pueden usar endpoints de alumno', 403);
	}

	const claimStudentId = decoded.studentId as string | undefined;
	const claimClassId = decoded.classId as string | undefined;
	const claimTeacherId = decoded.teacherId as string | undefined;

	if (decoded.role === 'student' && claimStudentId && claimClassId && claimTeacherId) {
		return {
			uid: decoded.uid,
			studentId: claimStudentId,
			classId: claimClassId,
			teacherId: claimTeacherId
		};
	}

	// Fallback: buscar por authUid en Firestore si el token aún no tenía todos los claims
	const db = getAdminDb();
	const snap = await db
		.collection('students')
		.where('authUid', '==', decoded.uid)
		.limit(1)
		.get();

	if (snap.empty) {
		throw new AuthError('Alumno no vinculado a ninguna clase', 403);
	}

	const doc = snap.docs[0];
	const data = doc.data();
	const studentId = doc.id;
	const classId = data.classId as string;
	const teacherId = data.teacherId as string;

	// Actualizar claims para que las siguientes peticiones no consulten Firestore
	await getAdminAuth()
		.setCustomUserClaims(decoded.uid, {
			role: 'student',
			studentId,
			classId,
			teacherId
		})
		.catch(() => {});

	return {
		uid: decoded.uid,
		studentId,
		classId,
		teacherId
	};
}
