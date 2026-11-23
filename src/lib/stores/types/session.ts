import type { User } from 'firebase/auth';

export interface TeacherSession {
	uid: string;
	email: string;
	name: string;
	emailVerified: boolean;
}

export interface StudentSession {
	uid: string;
	classId: string;
	studentId: string;
	classCode: string;
	className: string;
	displayName: string;
}

export interface StoredSession {
	student?: {
		classId: string;
		studentId: string;
		classCode: string;
		className: string;
		displayName: string;
	};
}

export interface SessionState {
	authUser: User | null;
	ready: boolean;
	loading: boolean;
	error: string | null;
	teacherSession: TeacherSession | null;
	studentSession: StudentSession | null;
}
