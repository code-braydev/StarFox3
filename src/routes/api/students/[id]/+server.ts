import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireTeacher,
	requireOwnedStudent,
	authErrorResponse
} from '$lib/server';

/**
 * GET /api/students/[id]
 * Devuelve el perfil completo del alumno (con su summary embebido), historial de intentos y sesiones.
 */
export const GET: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const studentId = event.params.id;
		const db = getAdminDb();

		const student = await requireOwnedStudent(db, studentId, teacher.uid);

		const [attemptsSnap, sessionsSnap] = await Promise.all([
			db.collection('attempts').where('studentId', '==', studentId).get(),
			db.collection('sessions').where('studentId', '==', studentId).get()
		]);

		const attempts = attemptsSnap.docs
			.map((d) => d.data())
			.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
			.slice(0, 50);
		const sessions = sessionsSnap.docs
			.map((d) => d.data())
			.sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))
			.slice(0, 20);

		return json({
			student,
			progress: student.summary,
			attempts,
			sessions,
			serverNow: Date.now()
		});
	} catch (err) {
		return authErrorResponse(err);
	}
};
