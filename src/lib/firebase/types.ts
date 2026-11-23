// Shared Firebase / Firestore types for the StarFox3 OVA

export type Role = 'teacher' | 'student';

export type PresenceStatus = 'online' | 'today' | 'idle' | 'never';

// ── teachers ─────────────────────────────────────────────
export interface Teacher {
	uid: string;
	email: string;
	name: string;
	createdAt: number;
	lastLoginAt: number;
}

// ── classes ──────────────────────────────────────────────
export interface ClassDoc {
	id: string;
	name: string;
	grade: string;
	teacherId: string;
	joinCode: string;
	pinEnabled: boolean;
	pin: string;
	createdAt: number;
	archived: boolean;
}

// ── student summary (embedded in StudentDoc) ─────────────
export interface StudentSummary {
	levelsCompleted: number[];
	stars: Record<string, number>;
	totalStars: number;
	totalCorrect: number;
	totalAttempts: number;
	totalPlayTimeMs: number;
	practiceModePlays: number;
}

/** Alias kept for compatibility with stores/merge */
export type ProgressDoc = StudentSummary & {
	updatedAt?: number;
};

// ── students (roster + presence + summary) ───────────────
export interface StudentDoc {
	id: string;
	classId: string;
	teacherId: string;
	displayName: string;
	pin?: string | null;
	authUid: string | null;
	createdAt: number;
	lastSeenAt: number | null;
	summary: StudentSummary | null;
	summaryUpdatedAt: number | null;
}

// ── attempts (level history) ─────────────────────────────
export type AttemptMode = 'adventure' | 'practice' | 'velocidad' | 'precision' | 'zen' | 'training';

export interface AttemptDoc {
	eventId: string;
	classId: string;
	teacherId: string;
	studentId: string;
	level: number;
	mode: AttemptMode;
	stars: number;
	correct: number;
	total: number;
	durationMs: number;
	completed: boolean;
	startedAt: number;
	completedAt: number;
}

// ── sessions (connection history) ────────────────────────
export interface SessionDoc {
	eventId: string;
	sessionId: string;
	classId: string;
	teacherId: string;
	studentId: string;
	startedAt: number;
	lastHeartbeatAt: number;
	userAgent: string;
}

// ── telemetry events (client -> server outbox) ───────────
export type TelemetryEvent =
	| {
			id: string;
			type: 'session_start';
			clientTs: number;
			sessionId: string;
			userAgent: string;
	  }
	| {
			id: string;
			type: 'session_heartbeat';
			clientTs: number;
			sessionId: string;
	  }
	| {
			id: string;
			type: 'level_attempt';
			clientTs: number;
			level: number;
			mode: AttemptMode;
			stars: number;
			correct: number;
			total: number;
			durationMs: number;
			completed: boolean;
			startedAt: number;
	  }
	| {
			id: string;
			type: 'progress_snapshot';
			clientTs: number;
			progress: StudentSummary;
	  };

// ── API responses ────────────────────────────────────────
export interface ApiError {
	error: string;
}

export interface JoinRosterEntry {
	studentId: string;
	displayName: string;
	hasPin?: boolean;
}
