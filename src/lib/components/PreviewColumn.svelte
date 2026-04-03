<script lang="ts">
	import type { Column } from "$lib/types";
	import PreviewCell from "./PreviewCell.svelte";

	let {
		column,
		colIndex,
	}: {
		column: Column;
		colIndex: number;
	} = $props();
</script>

<div class="preview-column">
	{#each column.cells as cell, cellIndex (cell)}
		<PreviewCell {cell} {colIndex} {cellIndex} />
	{/each}
</div>

<style>
	.preview-column {
		display: flex;
		flex-direction: column;
		gap: 3px;
		flex: 1;
		min-width: 0;
	}
</style>
