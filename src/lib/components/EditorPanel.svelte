<script lang="ts">
	import { table, addColumn, updateGlobalWidth, moveColumn } from "$lib/state.svelte";
	import ColumnEditor from "./ColumnEditor.svelte";

	let dragColIndex: number | null = $state(null);

	function handleColDragStart(colIndex: number, e: DragEvent) {
		dragColIndex = colIndex;
		e.dataTransfer!.effectAllowed = "move";
		e.dataTransfer!.setData("application/column", String(colIndex));
		(e.currentTarget as HTMLElement).style.opacity = "0.4";
		e.stopPropagation();
	}

	function handleColDragOver(colIndex: number, e: DragEvent) {
		if (e.dataTransfer!.types.includes("application/column")) {
			e.preventDefault();
			e.dataTransfer!.dropEffect = "move";
		}
	}

	function handleColDrop(targetColIndex: number, e: DragEvent) {
		e.preventDefault();
		const data = e.dataTransfer!.getData("application/column");
		if (data === "") return;
		const fromCol = parseInt(data, 10);
		moveColumn(fromCol, targetColIndex);
	}

	function handleColDragEnd(e: DragEvent) {
		(e.currentTarget as HTMLElement).style.opacity = "1";
		dragColIndex = null;
	}
</script>

<div class="flex flex-col h-full">
	<div class="px-3 py-2 border-b border-base-content/10">
		<h2 class="text-sm font-bold opacity-60 mb-2">エディタ</h2>
		<div class="flex items-center gap-2">
			<label class="text-xs opacity-50 shrink-0" for="col-width">列幅</label>
			<input
				id="col-width"
				type="range"
				class="range range-xs range-primary flex-1"
				min="0.1"
				max="2.0"
				step="0.05"
				value={table.column_width}
				oninput={(e) =>
					updateGlobalWidth(parseFloat((e.target as HTMLInputElement).value))}
			/>
			<span class="text-xs font-mono opacity-50 w-8 text-right">
				{table.column_width.toFixed(2)}
			</span>
		</div>
	</div>

	<div class="flex-1 overflow-auto p-3 space-y-3">
		{#each table.columns as column, colIndex (column)}
			<ColumnEditor
				{column}
				{colIndex}
				totalColumns={table.columns.length}
				ondragstartcolumn={(e) => handleColDragStart(colIndex, e)}
				ondragovercolumn={(e) => handleColDragOver(colIndex, e)}
				ondropcolumn={(e) => handleColDrop(colIndex, e)}
				ondragendcolumn={handleColDragEnd}
			/>
		{/each}

		<button
			type="button"
			class="btn btn-outline btn-sm btn-block opacity-60 hover:opacity-100"
			onclick={addColumn}
		>
			+ カラムを追加
		</button>
	</div>
</div>
