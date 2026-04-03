<script lang="ts">
	import type { Column } from "$lib/types";
	import { addCell, removeColumn, moveCell, moveCellAcross } from "$lib/state.svelte";
	import CellEditor from "./CellEditor.svelte";

	let {
		column,
		colIndex,
		totalColumns,
		ondragstartcolumn,
		ondragovercolumn,
		ondropcolumn,
		ondragendcolumn,
	}: {
		column: Column;
		colIndex: number;
		totalColumns: number;
		ondragstartcolumn?: (e: DragEvent) => void;
		ondragovercolumn?: (e: DragEvent) => void;
		ondropcolumn?: (e: DragEvent) => void;
		ondragendcolumn?: (e: DragEvent) => void;
	} = $props();

	function handleCellDragStart(cellIndex: number, e: DragEvent) {
		e.dataTransfer!.effectAllowed = "move";
		e.dataTransfer!.setData(
			"text/plain",
			JSON.stringify({ colIndex, cellIndex }),
		);
		(e.target as HTMLElement).style.opacity = "0.4";
	}

	function handleCellDragOver(cellIndex: number, e: DragEvent) {
		e.preventDefault();
		e.dataTransfer!.dropEffect = "move";
	}

	function handleCellDrop(targetCellIndex: number, e: DragEvent) {
		e.preventDefault();
		const data = e.dataTransfer!.getData("text/plain");
		if (!data) return;

		try {
			const { colIndex: fromCol, cellIndex: fromCell } = JSON.parse(data);
			if (fromCol === colIndex) {
				moveCell(colIndex, fromCell, targetCellIndex);
			} else {
				moveCellAcross(fromCol, fromCell, colIndex, targetCellIndex);
			}
		} catch {
			/* invalid drag data */
		}
	}

	function handleCellDragEnd(e: DragEvent) {
		(e.target as HTMLElement).style.opacity = "1";
	}
</script>

<div
	class="bg-base-100 border border-base-content/10 rounded-lg p-2"
	draggable="true"
	role="list"
	ondragstart={ondragstartcolumn}
	ondragover={ondragovercolumn}
	ondrop={ondropcolumn}
	ondragend={ondragendcolumn}
>
	<div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-base-content/8">
		<div class="flex items-center gap-2">
			<span class="cursor-grab opacity-30 text-sm select-none hover:opacity-70" title="ドラッグして並べ替え">⠿</span>
			<span class="text-xs font-bold opacity-60">
				カラム {colIndex + 1}
			</span>
			<span class="badge badge-sm badge-ghost">{column.cells.length}</span>
		</div>
		{#if totalColumns > 1}
			<button
				type="button"
				class="btn btn-ghost btn-xs text-error opacity-40 hover:opacity-100"
				onclick={() => removeColumn(colIndex)}
				title="カラムを削除"
			>
				✕
			</button>
		{/if}
	</div>

	<div class="flex flex-col gap-1">
		{#each column.cells as cell, cellIndex (cell)}
			<CellEditor
				{cell}
				{colIndex}
				{cellIndex}
				ondragstart={(e) => handleCellDragStart(cellIndex, e)}
				ondragover={(e) => handleCellDragOver(cellIndex, e)}
				ondrop={(e) => handleCellDrop(cellIndex, e)}
				ondragend={handleCellDragEnd}
			/>
		{/each}
	</div>

	<button
		type="button"
		class="btn btn-ghost btn-xs btn-block mt-1 text-xs opacity-50 hover:opacity-100"
		onclick={() => addCell(colIndex)}
	>
		+ セルを追加
	</button>
</div>

