<script lang="ts">
	import type { Cell } from "$lib/types";
	import {
		updateCellText,
		updateCellBgColor,
		updateCellTextColor,
		removeCell,
	} from "$lib/state.svelte";
	import { autoTextColor } from "$lib/color-utils";
	import ColorPicker from "./ColorPicker.svelte";

	let {
		cell,
		colIndex,
		cellIndex,
		ondragstartcell,
	}: {
		cell: Cell;
		colIndex: number;
		cellIndex: number;
		ondragstartcell?: (e: DragEvent) => void;
	} = $props();

	let editing = $state(false);
	let showColorPicker = $state(false);
	let inputEl: HTMLInputElement | undefined = $state();
	let cellEl: HTMLDivElement | undefined = $state();

	function handleClick(e: MouseEvent) {
		if (editing) return;
		e.stopPropagation();
		showColorPicker = !showColorPicker;
	}

	function handleDblClick(e: MouseEvent) {
		e.stopPropagation();
		showColorPicker = false;
		editing = true;
		requestAnimationFrame(() => inputEl?.focus());
	}

	function commitEdit() {
		editing = false;
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === "Escape") {
			editing = false;
		}
	}

	function handleBgChange(color: string) {
		updateCellBgColor(colIndex, cellIndex, color, true);
	}

	function handleTextColorChange(color: string) {
		updateCellTextColor(colIndex, cellIndex, color);
	}

	function handleClickOutside(e: MouseEvent) {
		if (cellEl && !cellEl.contains(e.target as Node)) {
			showColorPicker = false;
		}
	}

	function handleDragStart(e: DragEvent) {
		showColorPicker = false;
		e.dataTransfer!.effectAllowed = "move";
		e.dataTransfer!.setData(
			"application/cell",
			JSON.stringify({ colIndex, cellIndex }),
		);
		(e.currentTarget as HTMLElement).style.opacity = "0.4";
		ondragstartcell?.(e);
	}

	function handleDragEnd(e: DragEvent) {
		(e.currentTarget as HTMLElement).style.opacity = "1";
	}

	$effect(() => {
		if (showColorPicker) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	});
</script>

<div
	class="relative cursor-grab active:cursor-grabbing"
	bind:this={cellEl}
	draggable={!editing}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
>
	{#if editing}
		<input
			bind:this={inputEl}
			type="text"
			class="preview-cell-input w-full px-2 py-1 rounded text-[11px] font-medium text-center leading-tight min-h-5 border-none outline-2 outline-primary"
			style:background-color={cell.bg_color}
			style:color={cell.text_color}
			value={cell.text}
			oninput={(e) =>
				updateCellText(colIndex, cellIndex, (e.target as HTMLInputElement).value)}
			onblur={commitEdit}
			onkeydown={handleInputKeydown}
		/>
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="preview-cell px-2 py-1 rounded text-[11px] font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis leading-tight min-h-5 flex items-center justify-center cursor-pointer transition-[outline] duration-100 outline-2 outline-transparent hover:outline-base-content/30"
			class:outline-primary={showColorPicker}
			style:background-color={cell.bg_color}
			style:color={cell.text_color}
			onclick={handleClick}
			ondblclick={handleDblClick}
		>
			{cell.text || "\u00A0"}
		</div>
	{/if}

	{#if showColorPicker}
		<div class="picker-dropdown absolute top-full left-0 z-50 mt-1 p-2 bg-[#2a303c] border border-white/12 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)] min-w-[220px] flex flex-col gap-1.5">
			<div class="flex items-start gap-1.5">
				<span class="picker-label text-[11px] opacity-60 w-10 pt-1 shrink-0">背景</span>
				<ColorPicker value={cell.bg_color} onchange={handleBgChange} />
			</div>
			<div class="flex items-start gap-1.5">
				<span class="picker-label text-[11px] opacity-60 w-10 pt-1 shrink-0">文字</span>
				<ColorPicker
					value={cell.text_color}
					onchange={handleTextColorChange}
					showAutoToggle={true}
					isAuto={cell.text_color === autoTextColor(cell.bg_color)}
					onautotoggle={(auto) => {
						if (auto) updateCellBgColor(colIndex, cellIndex, cell.bg_color, true);
					}}
				/>
			</div>
			<button
				type="button"
				class="w-full px-2 py-1 mt-0.5 rounded text-[11px] border border-red-500/30 bg-transparent text-red-400/80 cursor-pointer transition-all duration-150 hover:bg-red-500/15 hover:border-red-500/50 hover:text-red-400"
				onclick={() => { removeCell(colIndex, cellIndex); showColorPicker = false; }}
			>
				このセルを削除
			</button>
		</div>
	{/if}
</div>

<style>
	.preview-cell.outline-primary {
		outline-color: oklch(var(--p));
	}
</style>
