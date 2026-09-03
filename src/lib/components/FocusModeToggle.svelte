<script lang="ts">
	let { size = 'md' }: { size?: 'sm' | 'md' | 'lg' } = $props();
</script>

<button class="focus-toggle {size}" aria-label="Modo enfoque">
	👁️
</button>

<style>
	.focus-toggle {
		background: none;
		border: 2px solid #6366f1;
		border-radius: 12px;
		color: #94A3B8;
		cursor: pointer;
		transition: border-color 0.2s, color 0.2s;
	}
	.focus-toggle:hover { border-color: #FBBF24; color: #FBBF24; }
	.focus-toggle.sm { padding: 6px 10px; font-size: 0.8rem; }
	.focus-toggle.md { padding: 8px 14px; font-size: 1rem; }
	.focus-toggle.lg { padding: 10px 18px; font-size: 1.2rem; }
</style>
