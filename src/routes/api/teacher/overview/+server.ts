import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireTeacher,
	getPresenceStatus,
	authErrorResponse
} from '$lib/server';
import type { ClassDoc, StudentDoc } from '$lib/firebase/types';

/**
 * GET /api/teacher/overview
 * Devuelve todas las clases del profesor con sus KPIs calculados en 2 consultas paralelas (sin N+1).
 */
export const GET: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const db = getAdminDb();
		const now = Date.now();
		const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

		const [classesSnap, studentsSnap] = await Promise.all([
			db.collection('classes').where('teacherId', '==', teacher.uid).get(),
			db.collection('students').where('teacherId', '==', teacher.uid).get()
		]);

		if (classesSnap.empty) {
			return json({ classes: [], serverNow: now });
		}

		// Agrupar alumnos por classId en memoria
		const studentsByClass = new Map<string, StudentDoc[]>();
		for (const doc of studentsSnap.docs) {
			const s = doc.data() as StudentDoc;
			const list = studentsByClass.get(s.classId) ?? [];
			list.push({ ...s, id: doc.id });
			studentsByClass.set(s.classId, list);
		}

		const result = classesSnap.docs
			.map((doc) => ({ ...(doc.data() as ClassDoc), id: doc.id }))
			.filter((cls) => !cls.archived)
			.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
			.map((cls) => {
				const classStudents = studentsByClass.get(cls.id) ?? [];
				const totalStudents = classStudents.length;

				let onlineNow = 0;
				let activeLast30d = 0;
				let neverPlayed = 0;
				let totalLevels = 0;
				let totalStars = 0;
				let totalCorrect = 0;
				let totalAttempts = 0;
				let totalTimeMs = 0;

				for (const s of classStudents) {
					const presence = getPresenceStatus(s.lastSeenAt, now);
					if (presence === 'online') onlineNow++;
					if (s.lastSeenAt && s.lastSeenAt >= thirtyDaysAgo) activeLast30d++;
					if (!s.lastSeenAt && !s.summary) neverPlayed++;

					if (s.summary) {
						totalLevels += s.summary.levelsCompleted?.length ?? 0;
						totalStars += s.summary.totalStars ?? 0;
						totalCorrect += s.summary.totalCorrect ?? 0;
						totalAttempts += s.summary.totalAttempts ?? 0;
						totalTimeMs += s.summary.totalPlayTimeMs ?? 0;
					}
				}

				const avgLevels = totalStudents > 0 ? Math.round(totalLevels / totalStudents) : 0;
				const avgStars = totalStudents > 0 ? Math.round(totalStars / totalStudents) : 0;
				const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

				return {
					...cls,
					kpis: {
						totalStudents,
						onlineNow,
						neverPlayed,
						activeLast30d,
						avgLevels,
						avgStars,
						accuracy,
						totalCorrect,
						totalAttempts,
						totalTimeMs
					}
				};
			});

		return json({ classes: result, serverNow: now });
	} catch (err) {
		return authErrorResponse(err);
	}
};
