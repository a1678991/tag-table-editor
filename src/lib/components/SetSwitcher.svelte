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

<div class="set-switcher">
	<div class="set-tabs">
		{#each getSetNames() as name (name)}
			{@const active = name === getActiveSetName()}
			{#if editingName === name}
				<input
					type="text"
					class="rename-input"
					bind:value={editValue}
					onblur={handleCommitRename}
					onkeydown={handleRenameKeydown}
				/>
			{:else}
				<div
					class="set-tab"
					class:active
					role="tab"
					tabindex="0"
					onclick={() => switchSet(name)}
					ondblclick={() => handleStartRename(name)}
					onkeydown={(e) => { if (e.key === "Enter") switchSet(name); }}
					title="クリックで切替 / ダブルクリックでリネーム"
				>
					<span class="set-tab-name">{name}</span>
					{#if getSetNames().length > 1}
						<button
							type="button"
							class="set-tab-close"
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
			<button type="button" class="set-tab add-tab" tabindex="0">+</button>
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
	.set-switcher {
		border-bottom: 1px solid oklch(var(--bc) / 0.1);
		background: oklch(var(--b2));
	}

	.set-tabs {
		display: flex;
		align-items: stretch;
		overflow-x: auto;
		padding: 0 8px;
		gap: 2px;
	}

	.set-tab {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		font-size: 12px;
		border: none;
		background: transparent;
		color: oklch(var(--bc) / 0.5);
		cursor: pointer;
		white-space: nowrap;
		border-bottom: 2px solid transparent;
		transition: all 0.15s;
	}

	.set-tab:hover {
		color: oklch(var(--bc) / 0.8);
		background: oklch(var(--bc) / 0.05);
	}

	.set-tab.active {
		color: oklch(var(--bc));
		border-bottom-color: oklch(var(--p));
	}

	.set-tab-name {
		max-width: 160px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.set-tab-close {
		font-size: 14px;
		line-height: 1;
		opacity: 0.3;
		cursor: pointer;
		background: none;
		border: none;
		color: inherit;
		padding: 0 2px;
	}

	.set-tab-close:hover {
		opacity: 1;
		color: oklch(var(--er));
	}

	.add-tab {
		font-size: 16px;
		opacity: 0.4;
		padding: 6px 10px;
	}

	.add-tab:hover {
		opacity: 0.8;
	}

	.rename-input {
		font-size: 12px;
		padding: 4px 8px;
		border: 1px solid oklch(var(--p));
		border-radius: 4px;
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		outline: none;
		min-width: 100px;
		max-width: 200px;
		margin: 4px 0;
	}
</style>
