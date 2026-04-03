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
	class="preview-cell-wrapper"
	bind:this={cellEl}
	draggable={!editing}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
>
	{#if editing}
		<input
			bind:this={inputEl}
			type="text"
			class="preview-cell-input"
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
			class="preview-cell"
			class:active={showColorPicker}
			style:background-color={cell.bg_color}
			style:color={cell.text_color}
			onclick={handleClick}
			ondblclick={handleDblClick}
		>
			{cell.text || "\u00A0"}
		</div>
	{/if}

	{#if showColorPicker}
		<div class="picker-dropdown">
			<div class="picker-row">
				<span class="picker-label">背景</span>
				<ColorPicker value={cell.bg_color} onchange={handleBgChange} />
			</div>
			<div class="picker-row">
				<span class="picker-label">文字</span>
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
				class="remove-cell-btn"
				onclick={() => { removeCell(colIndex, cellIndex); showColorPicker = false; }}
			>
				このセルを削除
			</button>
		</div>
	{/if}
</div>

<style>
	.preview-cell-wrapper {
		position: relative;
		cursor: grab;
	}

	.preview-cell-wrapper:active {
		cursor: grabbing;
	}

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
		cursor: pointer;
		transition: outline 0.1s;
		outline: 2px solid transparent;
	}

	.preview-cell:hover {
		outline: 2px solid oklch(var(--bc) / 0.3);
	}

	.preview-cell.active {
		outline: 2px solid oklch(var(--p));
	}

	.preview-cell-input {
		width: 100%;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		text-align: center;
		line-height: 1.3;
		min-height: 20px;
		border: none;
		outline: 2px solid oklch(var(--p));
	}

	.picker-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 50;
		margin-top: 4px;
		padding: 8px;
		background: #2a303c;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
		min-width: 220px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.picker-row {
		display: flex;
		align-items: flex-start;
		gap: 6px;
	}

	.picker-label {
		font-size: 11px;
		opacity: 0.6;
		width: 40px;
		padding-top: 4px;
		flex-shrink: 0;
	}

	.remove-cell-btn {
		width: 100%;
		padding: 4px 8px;
		margin-top: 2px;
		border-radius: 4px;
		font-size: 11px;
		border: 1px solid rgba(220, 50, 50, 0.3);
		background: transparent;
		color: rgba(220, 100, 100, 0.8);
		cursor: pointer;
		transition: all 0.15s;
	}

	.remove-cell-btn:hover {
		background: rgba(220, 50, 50, 0.15);
		border-color: rgba(220, 50, 50, 0.5);
		color: rgba(240, 120, 120, 1);
	}
</style>
