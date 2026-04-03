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

	let textAutoMode = $state(cell.text_color === autoTextColor(cell.bg_color));
</script>

<div
	class="flex items-start gap-1 p-1.5 rounded-md bg-base-200 border border-base-content/8 transition-[border-color] duration-150 hover:border-base-content/20"
	draggable="true"
	role="listitem"
	{ondragstart}
	{ondragover}
	{ondrop}
	{ondragend}
>
	<div class="cursor-grab opacity-30 text-sm leading-none p-0.5 select-none shrink-0 hover:opacity-70" title="ドラッグして並べ替え">⠿</div>

	<div class="flex-1 flex flex-col gap-1 min-w-0">
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

