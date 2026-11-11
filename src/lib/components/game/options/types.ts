export interface BaseOptionProps {
	value: number;
	correct?: boolean;
	selected?: boolean;
	disabled?: boolean;
	showResult?: boolean;
	revealedWrong?: boolean;
	variant?: 'idle' | 'correct' | 'wrong';
	onclick?: () => void;
}
