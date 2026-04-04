<script lang="ts">
	import { getTable, addColumn, moveColumn } from "$lib/state.svelte";
	import ColumnEditor from "./ColumnEditor.svelte";

	function handleColDragStart(colIndex: number, e: DragEvent) {
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
	}
</script>

<div class="flex flex-col h-full">
	<div class="px-3 py-2 border-b border-base-content/10">
		<h2 class="text-sm font-bold opacity-60">エディタ</h2>
	</div>

	<div class="flex-1 overflow-auto p-3 space-y-3">
		{#each getTable().columns as column, colIndex (column)}
			<ColumnEditor
				{column}
				{colIndex}
				totalColumns={getTable().columns.length}
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
