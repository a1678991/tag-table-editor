<script lang="ts">
	import {
		updateCellText,
		updateCellBgColor,
		updateCellTextColor,
		removeCell,
	} from "$lib/state.svelte";
	import { autoTextColor } from "$lib/color-utils";
	import type { Cell } from "$lib/types";
	import ColorPicker from "./ColorPicker.svelte";

	let {
		cell,
		colIndex,
		cellIndex,
		ondragstart,
		ondragover,
		ondrop,
		ondragend,
	}: {
		cell: Cell;
		colIndex: number;
		cellIndex: number;
		ondragstart?: (e: DragEvent) => void;
		ondragover?: (e: DragEvent) => void;
		ondrop?: (e: DragEvent) => void;
		ondragend?: (e: DragEvent) => void;
	} = $props();

	// eslint-disable-next-line -- intentional initial-value capture
	let textAutoMode = $state(cell.text_color === autoTextColor(cell.bg_color));
</script>

<div
	class="cell-editor"
	draggable="true"
	role="listitem"
	{ondragstart}
	{ondragover}
	{ondrop}
	{ondragend}
>
	<div class="drag-handle" title="ドラッグして並べ替え">⠿</div>

	<div class="cell-fields">
		<input
			type="text"
			class="input input-xs input-bordered w-full text-xs"
			placeholder="テキスト..."
			value={cell.text}
			oninput={(e) =>
				updateCellText(colIndex, cellIndex, (e.target as HTMLInputElement).value)}
		/>

		<div class="flex gap-2 items-start">
			<ColorPicker
				label="背景"
				value={cell.bg_color}
				onchange={(c) => updateCellBgColor(colIndex, cellIndex, c, textAutoMode)}
			/>
		</div>

		<div class="flex gap-2 items-start">
			<ColorPicker
				label="文字"
				value={cell.text_color}
				onchange={(c) => updateCellTextColor(colIndex, cellIndex, c)}
				showAutoToggle={true}
				isAuto={textAutoMode}
				onautotoggle={(auto) => {
					textAutoMode = auto;
					if (auto) {
						updateCellBgColor(colIndex, cellIndex, cell.bg_color, true);
					}
				}}
			/>
		</div>
	</div>

	<button
		type="button"
		class="btn btn-ghost btn-xs text-error opacity-40 hover:opacity-100"
		onclick={() => removeCell(colIndex, cellIndex)}
		title="セルを削除"
	>
		✕
	</button>
</div>

<style>
	.cell-editor {
		display: flex;
		align-items: flex-start;
		gap: 4px;
		padding: 6px;
		border-radius: 6px;
		background: oklch(var(--b2));
		border: 1px solid oklch(var(--bc) / 0.08);
		transition: border-color 0.15s;
	}

	.cell-editor:hover {
		border-color: oklch(var(--bc) / 0.2);
	}

	.drag-handle {
		cursor: grab;
		opacity: 0.3;
		font-size: 14px;
		line-height: 1;
		padding: 2px;
		user-select: none;
		flex-shrink: 0;
	}

	.drag-handle:hover {
		opacity: 0.7;
	}

	.cell-fields {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
</style>
