import type { Firestore, DocumentReference } from 'firebase-admin/firestore';
import type { ClassDoc, StudentDoc } from '$lib/firebase/types';
import { AuthError } from './http';
import { normaliseJoinCode } from './join-code';

/**
 * Obtiene una clase y verifica que exista y pertenezca al profesor autenticado.
 * Elimina la duplicación en todos los endpoints de /api/classes/[id]/*.
 */
export async function requireOwnedClass(
	db: Firestore,
	classId: string,
	teacherUid: string
): Promise<ClassDoc> {
	if (!classId) {
		throw new AuthError('ID de clase inválido', 400);
	}
	const snap = await db.collection('classes').doc(classId).get();
	if (!snap.exists) {
		throw new AuthError('Clase no encontrada', 404);
	}
	const data = snap.data() as ClassDoc;
	if (data.teacherId !== teacherUid) {
		throw new AuthError('No autorizado', 403);
	}
	return { ...data, id: snap.id };
}

/**
 * Obtiene un alumno y verifica que exista y pertenezca a una clase del profesor autenticado.
 */
export async function requireOwnedStudent(
	db: Firestore,
	studentId: string,
	teacherUid: string
): Promise<StudentDoc> {
	if (!studentId) {
		throw new AuthError('ID de alumno inválido', 400);
	}
	const snap = await db.collection('students').doc(studentId).get();
	if (!snap.exists) {
		throw new AuthError('Alumno no encontrado', 404);
	}
	const data = snap.data() as StudentDoc;
	if (data.teacherId !== teacherUid) {
		throw new AuthError('No autorizado', 403);
	}
	return { ...data, id: snap.id };
}

/**
 * Busca una clase activa a partir de su código de invitación.
 */
export async function findActiveClassByCode(
	db: Firestore,
	rawCode: string
): Promise<ClassDoc> {
	const code = normaliseJoinCode(rawCode ?? '');
	if (!code || code.length < 4) {
		throw new AuthError('Código inválido', 400);
	}

	const snap = await db
		.collection('classes')
		.where('joinCode', '==', code)
		.limit(1)
		.get();

	if (snap.empty) {
		throw new AuthError('Clase no encontrada', 404);
	}

	const doc = snap.docs[0];
	const cls = doc.data() as ClassDoc;
	if (cls.archived) {
		throw new AuthError('Esta clase ya no está activa', 410);
	}

	return { ...cls, id: doc.id };
}

/**
 * Borra una lista arbitraria de referencias de Firestore respetando el límite de 500 por batch.
 */
export async function deleteRefsInBatches(
	db: Firestore,
	refs: DocumentReference[]
): Promise<void> {
	const CHUNK_SIZE = 450;
	for (let i = 0; i < refs.length; i += CHUNK_SIZE) {
		const chunk = refs.slice(i, i + CHUNK_SIZE);
		const batch = db.batch();
		for (const ref of chunk) {
			batch.delete(ref);
		}
		await batch.commit();
	}
}
