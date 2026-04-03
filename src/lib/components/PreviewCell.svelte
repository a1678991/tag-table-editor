<script lang="ts">
	import type { Cell } from "$lib/types";

	let { cell }: { cell: Cell } = $props();
</script>

<div
	class="preview-cell"
	style:background-color={cell.bg_color}
	style:color={cell.text_color}
>
	{cell.text || "\u00A0"}
</div>

<style>
	.preview-cell {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.3;
		min-height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
