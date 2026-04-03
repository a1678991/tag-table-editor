<script lang="ts">
	import type { Column } from "$lib/types";
	import PreviewCell from "./PreviewCell.svelte";

	let { column }: { column: Column } = $props();
</script>

<div class="preview-column">
	{#each column.cells as cell (cell)}
		<PreviewCell {cell} />
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
