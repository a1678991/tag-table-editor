<script lang="ts">
	import {
		getActiveSetName,
		getSetNames,
		switchSet,
		createSet,
		deleteSet,
		renameSet,
		duplicateSet,
		moveSet,
	} from "$lib/state.svelte";

	let editingName: string | null = $state(null);
	let editValue = $state("");
	let contextMenu: { name: string; x: number; y: number } | null = $state(null);

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

	function handleContextMenu(e: MouseEvent, name: string) {
		e.preventDefault();
		contextMenu = { name, x: e.clientX, y: e.clientY };
	}

	function closeContextMenu() {
		contextMenu = null;
	}

	function handleTabDragStart(index: number, e: DragEvent) {
		e.dataTransfer!.effectAllowed = "move";
		e.dataTransfer!.setData("application/set-tab", String(index));
		(e.currentTarget as HTMLElement).style.opacity = "0.4";
		e.stopPropagation();
	}

	function handleTabDragOver(index: number, e: DragEvent) {
		if (e.dataTransfer!.types.includes("application/set-tab")) {
			e.preventDefault();
			e.dataTransfer!.dropEffect = "move";
		}
	}

	function handleTabDrop(targetIndex: number, e: DragEvent) {
		e.preventDefault();
		const raw = e.dataTransfer!.getData("application/set-tab");
		if (raw === "") return;
		const fromIndex = parseInt(raw, 10);
		moveSet(fromIndex, targetIndex);
	}

	function handleTabDragEnd(e: DragEvent) {
		(e.currentTarget as HTMLElement).style.opacity = "1";
	}

</script>

<svelte:window onkeydown={(e) => { if (e.key === "Escape") closeContextMenu(); }} />

<div class="border-b border-base-content/10 bg-base-200">
	<div class="flex items-stretch px-2 gap-0.5">
		<div class="flex items-stretch overflow-x-auto gap-0.5">
			{#each getSetNames() as name, index (name)}
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
						draggable="true"
						onclick={() => switchSet(name)}
						ondblclick={() => handleStartRename(name)}
						oncontextmenu={(e) => handleContextMenu(e, name)}
						onkeydown={(e) => { if (e.key === "Enter") switchSet(name); }}
						ondragstart={(e) => handleTabDragStart(index, e)}
						ondragover={(e) => handleTabDragOver(index, e)}
						ondrop={(e) => handleTabDrop(index, e)}
						ondragend={handleTabDragEnd}
						title="ドラッグで並び替え / クリックで切替 / ダブルクリックでリネーム / 右クリックでメニュー"
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
		</div>

		<button
			type="button"
			class="add-tab text-base opacity-40 px-2.5 py-1.5 bg-transparent border-none cursor-pointer hover:opacity-80"
			onclick={() => createSet()}
			title="新しいセットを追加"
		>+</button>
	</div>
</div>

{#if contextMenu}
	{@const menuName = contextMenu.name}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="set-tab-context-backdrop fixed inset-0 z-40" onclick={closeContextMenu}></div>
	<ul
		class="set-tab-context-menu menu bg-base-200 rounded-box z-50 w-48 p-2 shadow-lg fixed"
		style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
	>
		<li>
			<button type="button" onclick={() => { duplicateSet(menuName); closeContextMenu(); }}>
				複製
			</button>
		</li>
		<li>
			<button type="button" onclick={() => { handleStartRename(menuName); closeContextMenu(); }}>
				リネーム
			</button>
		</li>
		{#if getSetNames().length > 1}
			<li>
				<button type="button" onclick={() => { deleteSet(menuName); closeContextMenu(); }}>
					削除
				</button>
			</li>
		{/if}
	</ul>
{/if}

<style>
	.set-tab.active {
		color: oklch(var(--bc));
		border-bottom-color: oklch(var(--p));
	}
</style>
