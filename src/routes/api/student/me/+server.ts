import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAdminDb, requireStudent, apiError, authErrorResponse } from '$lib/server';
import type { StudentDoc } from '$lib/firebase/types';

/**
 * GET /api/student/me
 * Devuelve el perfil y resumen del alumno leyendo directamente su documento por ID.
 */
export const GET: RequestHandler = async (event) => {
	try {
		const { studentId } = await requireStudent(event);
		const db = getAdminDb();

		const snap = await db.collection('students').doc(studentId).get();
		if (!snap.exists) {
			return apiError('Alumno no encontrado', 404);
		}
		const studentData = snap.data() as StudentDoc;

		return json({
			student: {
				studentId: snap.id,
				classId: studentData.classId,
				displayName: studentData.displayName
			},
			progress: studentData.summary
				? { ...studentData.summary, updatedAt: studentData.summaryUpdatedAt ?? 0 }
				: null
		});
	} catch (err) {
		return authErrorResponse(err);
	}
};
