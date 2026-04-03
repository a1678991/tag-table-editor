<script lang="ts">
	import {
		getActiveSetName,
		getSetNames,
		switchSet,
		createSet,
		deleteSet,
		renameSet,
		duplicateSet,
	} from "$lib/state.svelte";

	let editingName: string | null = $state(null);
	let editValue = $state("");

	function handleStartRename(name: string) {
		editingName = name;
		editValue = name;
		requestAnimationFrame(() => {
			const input = document.querySelector(".rename-input") as HTMLInputElement;
			input?.select();
		});
	}

	function handleCommitRename() {
		if (editingName && editValue.trim()) {
			renameSet(editingName, editValue.trim());
		}
		editingName = null;
	}

	function handleRenameKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") handleCommitRename();
		if (e.key === "Escape") editingName = null;
	}
</script>

<div class="border-b border-base-content/10 bg-base-200">
	<div class="flex items-stretch overflow-x-auto px-2 gap-0.5">
		{#each getSetNames() as name (name)}
			{@const active = name === getActiveSetName()}
			{#if editingName === name}
				<input
					type="text"
					class="rename-input text-xs px-2 py-1 border border-primary rounded bg-base-100 text-base-content outline-none min-w-[100px] max-w-[200px] my-1"
					bind:value={editValue}
					onblur={handleCommitRename}
					onkeydown={handleRenameKeydown}
				/>
			{:else}
				<div
					class="set-tab flex items-center gap-1 px-2.5 py-1.5 text-xs bg-transparent text-base-content/50 cursor-pointer whitespace-nowrap border-b-2 border-transparent transition-all duration-150 hover:text-base-content/80 hover:bg-base-content/5"
					class:active
					role="tab"
					tabindex="0"
					onclick={() => switchSet(name)}
					ondblclick={() => handleStartRename(name)}
					onkeydown={(e) => { if (e.key === "Enter") switchSet(name); }}
					title="クリックで切替 / ダブルクリックでリネーム"
				>
					<span class="set-tab-name max-w-40 overflow-hidden text-ellipsis">{name}</span>
					{#if getSetNames().length > 1}
						<button
							type="button"
							class="set-tab-close text-sm leading-none opacity-30 cursor-pointer bg-transparent border-none text-inherit px-0.5 hover:opacity-100 hover:text-error"
							onclick={(e) => { e.stopPropagation(); deleteSet(name); }}
							title="削除"
						>
							×
						</button>
					{/if}
				</div>
			{/if}
		{/each}

		<div class="dropdown dropdown-end">
			<button type="button" class="add-tab text-base opacity-40 px-2.5 py-1.5 bg-transparent border-none cursor-pointer hover:opacity-80" tabindex="0">+</button>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul tabindex="0" class="dropdown-content menu bg-base-200 rounded-box z-50 w-48 p-2 shadow-lg">
				<li>
					<button type="button" onclick={() => createSet()}>
						空のセット
					</button>
				</li>
				<li>
					<button type="button" onclick={() => createSet("softwareArchitecture")}>
						テンプレートから
					</button>
				</li>
				<li>
					<button type="button" onclick={() => duplicateSet(getActiveSetName())}>
						現在のセットを複製
					</button>
				</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.set-tab.active {
		color: oklch(var(--bc));
		border-bottom-color: oklch(var(--p));
	}
</style>
