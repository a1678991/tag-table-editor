<script lang="ts">
	import { isValidColor, PRESET_COLORS } from "$lib/color-utils";
	import { getRecentColors, addRecentColor } from "$lib/persistence";

	let {
		value,
		onchange,
		label = "",
		showAutoToggle = false,
		isAuto = false,
		onautotoggle,
	}: {
		value: string;
		onchange: (color: string) => void;
		label?: string;
		showAutoToggle?: boolean;
		isAuto?: boolean;
		onautotoggle?: (auto: boolean) => void;
	} = $props();

	let expanded = $state(false);
	let pickerEl: HTMLDivElement | undefined = $state();

	let recentColors = $state<string[]>([]);

	function applyColor(color: string) {
		if (!isValidColor(color)) return;
		addRecentColor(color);
		recentColors = getRecentColors();
		onchange(color);
	}

	function handleInputBlur(e: FocusEvent) {
		const input = e.target as HTMLInputElement;
		if (isValidColor(input.value)) {
			applyColor(input.value.toUpperCase());
		} else {
			input.value = value;
		}
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			(e.target as HTMLInputElement).blur();
		}
	}

	function handleNativeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		applyColor(target.value.toUpperCase());
	}

	function toggleExpanded() {
		if (!expanded) {
			recentColors = getRecentColors();
		}
		expanded = !expanded;
	}

	function handleClickOutside(e: MouseEvent) {
		if (pickerEl && !pickerEl.contains(e.target as Node)) {
			expanded = false;
		}
	}

	$effect(() => {
		if (expanded) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	});
</script>

<div class="color-picker" bind:this={pickerEl}>
	<div class="flex items-center gap-1.5">
		{#if label}
			<span class="text-[10px] opacity-50 w-7 shrink-0">{label}</span>
		{/if}

		<button
			type="button"
			class="swatch"
			style:background-color={value}
			onclick={toggleExpanded}
			disabled={isAuto}
			title="色を選択"
		></button>

		<input
			type="text"
			class="hex-input"
			value={value}
			onblur={handleInputBlur}
			onkeydown={handleInputKeydown}
			disabled={isAuto}
			maxlength={9}
		/>

		{#if showAutoToggle}
			<label class="flex items-center gap-1 cursor-pointer" title="自動計算">
				<span class="text-[9px] opacity-40">自動</span>
				<input
					type="checkbox"
					class="toggle toggle-xs toggle-primary"
					checked={isAuto}
					onchange={() => onautotoggle?.(!isAuto)}
				/>
			</label>
		{/if}
	</div>

	{#if expanded && !isAuto}
		<div class="picker-panel">
			<input
				type="color"
				class="native-picker"
				value={value}
				oninput={handleNativeChange}
			/>

			<div class="section-label">プリセット</div>
			<div class="swatch-grid">
				{#each PRESET_COLORS as color (color)}
					<button
						type="button"
						class="preset-swatch"
						class:active={value === color}
						style:background-color={color}
						onclick={() => applyColor(color)}
						title={color}
					></button>
				{/each}
			</div>

			{#if recentColors.length > 0}
				<div class="section-label">最近使った色</div>
				<div class="swatch-grid">
					{#each recentColors as color (color)}
						<button
							type="button"
							class="preset-swatch"
							class:active={value === color}
							style:background-color={color}
							onclick={() => applyColor(color)}
							title={color}
						></button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.color-picker {
		position: relative;
	}

	.swatch {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		border: 2px solid oklch(var(--bc) / 0.2);
		cursor: pointer;
		flex-shrink: 0;
		transition: border-color 0.15s;
	}

	.swatch:hover:not(:disabled) {
		border-color: oklch(var(--bc) / 0.5);
	}

	.swatch:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.hex-input {
		width: 72px;
		font-size: 11px;
		font-family: monospace;
		padding: 2px 4px;
		border-radius: 4px;
		border: 1px solid oklch(var(--bc) / 0.15);
		background: oklch(var(--b2));
		color: oklch(var(--bc));
	}

	.hex-input:disabled {
		opacity: 0.4;
	}

	.picker-panel {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 50;
		margin-top: 4px;
		padding: 8px;
		background: #2a303c;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		min-width: 200px;
	}

	.native-picker {
		width: 100%;
		height: 36px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		background: none;
		padding: 0;
	}

	.native-picker::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.native-picker::-webkit-color-swatch {
		border: 1px solid oklch(var(--bc) / 0.15);
		border-radius: 4px;
	}

	.section-label {
		font-size: 10px;
		opacity: 0.4;
		margin-top: 6px;
		margin-bottom: 3px;
	}

	.swatch-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}

	.preset-swatch {
		width: 18px;
		height: 18px;
		border-radius: 3px;
		border: 1.5px solid oklch(var(--bc) / 0.15);
		cursor: pointer;
		transition: transform 0.1s;
	}

	.preset-swatch:hover {
		transform: scale(1.2);
	}

	.preset-swatch.active {
		border-color: oklch(var(--bc) / 0.8);
		box-shadow: 0 0 0 1.5px oklch(var(--p));
	}
</style>
