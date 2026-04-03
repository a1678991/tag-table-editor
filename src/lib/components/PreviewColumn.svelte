<script lang="ts">
	import type { Column } from "$lib/types";
	import { addCell, removeColumn } from "$lib/state.svelte";
	import PreviewCell from "./PreviewCell.svelte";

	let {
		column,
		colIndex,
		totalColumns,
	}: {
		column: Column;
		colIndex: number;
		totalColumns: number;
	} = $props();
</script>

<div class="preview-column">
	{#each column.cells as cell, cellIndex (cell)}
		<PreviewCell {cell} {colIndex} {cellIndex} />
	{/each}
	<button
		type="button"
		class="add-row-btn"
		onclick={() => addCell(colIndex)}
		title="セルを追加"
	>
		+
	</button>
	{#if totalColumns > 1}
		<button
			type="button"
			class="remove-col-btn"
			onclick={() => removeColumn(colIndex)}
			title="カラムを削除"
		>
			×
		</button>
	{/if}
</div>

<style>
	.preview-column {
		display: flex;
		flex-direction: column;
		gap: 3px;
		flex: 1;
		min-width: 0;
		position: relative;
	}

	.add-row-btn {
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		text-align: center;
		line-height: 1.3;
		min-height: 20px;
		border: 1px dashed rgba(255, 255, 255, 0.15);
		background: transparent;
		color: rgba(255, 255, 255, 0.25);
		cursor: pointer;
		transition: all 0.15s;
	}

	.add-row-btn:hover {
		border-color: rgba(255, 255, 255, 0.4);
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.05);
	}

	.remove-col-btn {
		position: absolute;
		top: -8px;
		right: -4px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		font-size: 10px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: rgba(180, 40, 40, 0.7);
		color: white;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.preview-column:hover .remove-col-btn {
		opacity: 1;
	}

	.remove-col-btn:hover {
		background: rgba(220, 40, 40, 0.9);
	}
</style>
