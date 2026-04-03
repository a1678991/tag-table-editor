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

<div class="relative" bind:this={pickerEl}>
	<div class="flex items-center gap-1.5">
		{#if label}
			<span class="text-[10px] opacity-50 w-7 shrink-0">{label}</span>
		{/if}

		<button
			type="button"
			class="swatch w-5 h-5 rounded border-2 border-base-content/20 cursor-pointer shrink-0 transition-[border-color] duration-150 hover:not-disabled:border-base-content/50 disabled:opacity-40 disabled:cursor-not-allowed"
			style:background-color={value}
			onclick={toggleExpanded}
			disabled={isAuto}
			title="色を選択"
		></button>

		<input
			type="text"
			class="w-18 text-[11px] font-mono px-1 py-0.5 rounded border border-base-content/15 bg-base-200 text-base-content disabled:opacity-40"
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
		<div class="absolute top-full left-0 z-50 mt-1 p-2 bg-[#2a303c] border border-white/12 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] min-w-[200px]">
			<input
				type="color"
				class="native-picker w-full h-9 border-none rounded cursor-pointer bg-transparent p-0"
				value={value}
				oninput={handleNativeChange}
			/>

			<div class="text-[10px] opacity-40 mt-1.5 mb-1">プリセット</div>
			<div class="flex flex-wrap gap-[3px]">
				{#each PRESET_COLORS as color (color)}
					<button
						type="button"
						class="preset-swatch w-[18px] h-[18px] rounded-sm border-[1.5px] border-base-content/15 cursor-pointer transition-transform duration-100 hover:scale-120"
						class:active={value === color}
						style:background-color={color}
						onclick={() => applyColor(color)}
						title={color}
					></button>
				{/each}
			</div>

			{#if recentColors.length > 0}
				<div class="text-[10px] opacity-40 mt-1.5 mb-1">最近使った色</div>
				<div class="flex flex-wrap gap-[3px]">
					{#each recentColors as color (color)}
						<button
							type="button"
							class="preset-swatch w-[18px] h-[18px] rounded-sm border-[1.5px] border-base-content/15 cursor-pointer transition-transform duration-100 hover:scale-120"
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
	.native-picker::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.native-picker::-webkit-color-swatch {
		border: 1px solid oklch(var(--bc) / 0.15);
		border-radius: 4px;
	}

	.preset-swatch.active {
		border-color: oklch(var(--bc) / 0.8);
		box-shadow: 0 0 0 1.5px oklch(var(--p));
	}
</style>
