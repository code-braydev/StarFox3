<script lang="ts">
	import { playClick } from '$lib/audio/audio';
	import { game } from '$lib/stores/game.svelte';

	let { color = 'primary', size = 'lg', disabled = false, onclick, children }: {
		color?: 'primary' | 'accent' | 'interactive' | 'success';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		onclick?: () => void;
		children?: any;
	} = $props();

	function handleClick() {
		if (disabled) return;
		if (game.soundEnabled) playClick();
		onclick?.();
	}
</script>

<button
	class="game-btn {color} {size}"
	class:disabled
	{disabled}
	onclick={handleClick}
>
	{@render children?.()}
</button>

<style>
	.game-btn {
		font-family: 'Poppins', sans-serif;
		font-weight: bold;
		border: none;
		border-radius: 16px;
		cursor: pointer;
		transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
					box-shadow 0.2s,
					opacity 0.2s;
		text-transform: uppercase;
		letter-spacing: 1px;
		min-width: 60px;
		min-height: 44px;
	}

	.game-btn:hover:not(:disabled) { transform: scale(1.05); }
	.game-btn:active:not(:disabled) { transform: scale(0.95); }
	.game-btn.disabled { opacity: 0.5; cursor: not-allowed; }

	.game-btn.primary {
		background: linear-gradient(135deg, #4F46E5, #6366f1);
		color: white;
		box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
	}
	.game-btn.accent {
		background: linear-gradient(135deg, #4F46E5, #818cf8);
		color: white;
		box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
	}
	.game-btn.interactive {
		background: linear-gradient(135deg, #FBBF24, #f59e0b);
		color: #1E1E2F;
		box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
	}
	.game-btn.success {
		background: linear-gradient(135deg, #22c55e, #16a34a);
		color: white;
		box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
	}

	.game-btn.sm { padding: 8px 16px; font-size: 0.875rem; }
	.game-btn.md { padding: 12px 24px; font-size: 1rem; }
	.game-btn.lg { padding: 16px 32px; font-size: 1.25rem; min-height: 56px; }
</style>
