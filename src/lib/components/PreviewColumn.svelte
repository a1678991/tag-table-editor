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
		const col = e.currentTarget as HTMLElement;
		if (!col.contains(e.relatedTarget as Node)) {
			dropIndex = null;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative flex flex-col gap-[3px] flex-1 min-w-0"
	ondrop={handleDrop}
	ondragleave={handleDragLeave}
>
	{#each column.cells as cell, cellIndex (cell)}
		{#if dropIndex === cellIndex}
			<div class="h-0.5 bg-primary rounded-sm -my-px shadow-[0_0_6px_oklch(var(--p)/0.5)]"></div>
		{/if}
		<div
			class="relative"
			ondragover={(e) => handleDragOver(cellIndex, e)}
		>
			<PreviewCell {cell} {colIndex} {cellIndex} />
		</div>
	{/each}
	{#if dropIndex === column.cells.length}
		<div class="h-0.5 bg-primary rounded-sm -my-px shadow-[0_0_6px_oklch(var(--p)/0.5)]"></div>
	{/if}
	<div
		class="relative"
		ondragover={(e) => handleDragOverGap(column.cells.length, e)}
	>
		<button
			type="button"
			class="w-full px-2 py-0.5 rounded text-sm font-medium text-center leading-tight min-h-5 border border-dashed border-white/15 bg-transparent text-white/25 cursor-pointer transition-all duration-150 hover:border-white/40 hover:text-white/60 hover:bg-white/5"
			onclick={() => addCell(colIndex)}
			title="セルを追加"
		>
			+
		</button>
	</div>
	{#if totalColumns > 1}
		<button
			type="button"
			class="absolute -top-2 -right-1 w-4 h-4 rounded-full text-[10px] leading-none flex items-center justify-center border-none bg-red-700/70 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-600/90"
			onclick={() => removeColumn(colIndex)}
			title="カラムを削除"
		>
			×
		</button>
	{/if}
</div>
