<script lang="ts">
	import type { Column } from "$lib/types";
	import { addCell, removeColumn, moveCell, moveCellAcross } from "$lib/state.svelte";
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

	let dropIndex: number | null = $state(null);

	function handleDragOver(cellIndex: number, e: DragEvent) {
		if (!e.dataTransfer!.types.includes("application/cell")) return;
		e.preventDefault();
		e.dataTransfer!.dropEffect = "move";

		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const midY = rect.top + rect.height / 2;
		dropIndex = e.clientY < midY ? cellIndex : cellIndex + 1;
	}

	function handleDragOverGap(insertAt: number, e: DragEvent) {
		if (!e.dataTransfer!.types.includes("application/cell")) return;
		e.preventDefault();
		e.dataTransfer!.dropEffect = "move";
		dropIndex = insertAt;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		const raw = e.dataTransfer!.getData("application/cell");
		if (!raw || dropIndex === null) return;

		try {
			const { colIndex: fromCol, cellIndex: fromCell } = JSON.parse(raw);
			if (fromCol === colIndex) {
				const adjustedTarget = fromCell < dropIndex ? dropIndex - 1 : dropIndex;
				moveCell(colIndex, fromCell, adjustedTarget);
			} else {
				moveCellAcross(fromCol, fromCell, colIndex, dropIndex);
			}
		} catch {
			/* invalid data */
		}
		dropIndex = null;
	}

	function handleDragLeave(e: DragEvent) {
		const col = (e.currentTarget as HTMLElement);
		if (!col.contains(e.relatedTarget as Node)) {
			dropIndex = null;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="preview-column"
	ondrop={handleDrop}
	ondragleave={handleDragLeave}
>
	{#each column.cells as cell, cellIndex (cell)}
		{#if dropIndex === cellIndex}
			<div class="drop-indicator"></div>
		{/if}
		<div
			class="cell-drop-zone"
			ondragover={(e) => handleDragOver(cellIndex, e)}
		>
			<PreviewCell {cell} {colIndex} {cellIndex} />
		</div>
	{/each}
	{#if dropIndex === column.cells.length}
		<div class="drop-indicator"></div>
	{/if}
	<div
		class="add-row-zone"
		ondragover={(e) => handleDragOverGap(column.cells.length, e)}
	>
		<button
			type="button"
			class="add-row-btn"
			onclick={() => addCell(colIndex)}
			title="セルを追加"
		>
			+
		</button>
	</div>
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

	.cell-drop-zone {
		position: relative;
	}

	.add-row-zone {
		position: relative;
	}

	.drop-indicator {
		height: 2px;
		background: oklch(var(--p));
		border-radius: 1px;
		margin: -1px 0;
		box-shadow: 0 0 6px oklch(var(--p) / 0.5);
	}

	.add-row-btn {
		width: 100%;
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
