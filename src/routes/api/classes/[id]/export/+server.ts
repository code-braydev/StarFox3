import type { RequestHandler } from './$types';
import {
	getAdminDb,
	requireTeacher,
	requireOwnedClass,
	getPresenceStatus,
	authErrorResponse
} from '$lib/server';
import type { StudentDoc } from '$lib/firebase/types';

export const GET: RequestHandler = async (event) => {
	try {
		const teacher = await requireTeacher(event);
		const classId = event.params.id;
		const db = getAdminDb();

		const classData = await requireOwnedClass(db, classId, teacher.uid);

		const studentsSnap = await db
			.collection('students')
			.where('classId', '==', classId)
			.get();

		const sortedStudents = studentsSnap.docs
			.map((d) => d.data() as StudentDoc)
			.sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? '', 'es'));

		const now = Date.now();
		const rows: string[] = [];
		rows.push(
			[
				'Nombre',
				'Estado',
				'Niveles completados',
				'Estrellas totales',
				'Precisión (%)',
				'Aciertos',
				'Intentos',
				'Prácticas',
				'Tiempo jugado (min)',
				'Última conexión'
			].join(',')
		);

		for (const student of sortedStudents) {
			const summary = student.summary;
			const presence = getPresenceStatus(student.lastSeenAt, now);
			const statusLabel =
				presence === 'online'
					? 'Jugando ahora'
					: presence === 'today'
						? 'Activo hoy'
						: presence === 'idle'
							? 'Inactivo'
							: 'Sin uso';

			const levels = summary?.levelsCompleted?.length ?? 0;
			const totalStars = summary?.totalStars ?? 0;
			const correct = summary?.totalCorrect ?? 0;
			const attempts = summary?.totalAttempts ?? 0;
			const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
			const practices = summary?.practiceModePlays ?? 0;
			const timeMs = summary?.totalPlayTimeMs ?? 0;
			const timeMin = Math.round(timeMs / 60000);
			const lastSeenStr = student.lastSeenAt
				? new Date(student.lastSeenAt).toISOString().slice(0, 16).replace('T', ' ')
				: 'Nunca';

			const name = escapeCsv(student.displayName);
			rows.push(
				[
					name,
					statusLabel,
					levels,
					totalStars,
					accuracy,
					correct,
					attempts,
					practices,
					timeMin,
					lastSeenStr
				].join(',')
			);
		}

		const csv = '\uFEFF' + rows.join('\n'); // BOM UTF-8 para que Excel abra acentos correctamente
		const filename = `clase-${classData.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;

		return new Response(csv, {
			headers: {
				'content-type': 'text/csv; charset=utf-8',
				'content-disposition': `attachment; filename="${filename}"`
			}
		});
	} catch (err) {
		return authErrorResponse(err);
	}
};

function escapeCsv(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
