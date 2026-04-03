<script lang="ts">
	import { table, getTotalTags } from "$lib/state.svelte";
	import PreviewColumn from "./PreviewColumn.svelte";
</script>

<div class="flex flex-col h-full">
	<div class="px-3 py-2 border-b border-base-content/10 flex items-center justify-between">
		<h2 class="text-sm font-bold opacity-60">プレビュー</h2>
		<span class="text-xs opacity-40">{getTotalTags()} タグ</span>
	</div>

	<div class="flex-1 overflow-auto p-4">
		<div class="preview-stage">
			<div class="preview-grid">
				{#each table.columns as column, colIndex (column)}
					<PreviewColumn {column} {colIndex} />
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.preview-stage {
		background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
		border-radius: 12px;
		padding: 16px;
		min-height: 200px;
		box-shadow:
			inset 0 1px 3px rgba(0, 0, 0, 0.4),
			0 0 40px rgba(15, 52, 96, 0.15);
	}

	.preview-grid {
		display: flex;
		gap: 6px;
	}
</style>
