import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAdminDb, findActiveClassByCode, authErrorResponse } from '$lib/server';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const db = getAdminDb();
		const cls = await findActiveClassByCode(db, params.code);

		return json({
			className: cls.name,
			grade: cls.grade,
			pinRequired: cls.pinEnabled === true
		});
	} catch (err) {
		return authErrorResponse(err);
	}
};
