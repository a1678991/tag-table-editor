<script lang="ts">
	import { resetTable, undo, redo, canUndo, canRedo } from "$lib/state.svelte";
	import ValidationBadge from "./ValidationBadge.svelte";
	import TemplateModal from "./TemplateModal.svelte";

	let {
		showEditor = $bindable(false),
	}: {
		showEditor: boolean;
	} = $props();

	let templateOpen = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
			e.preventDefault();
			undo();
		}
		if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
			e.preventDefault();
			redo();
		}
		if ((e.ctrlKey || e.metaKey) && e.key === "y") {
			e.preventDefault();
			redo();
		}
	}

	$effect(() => {
		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	});
</script>

<nav class="navbar bg-base-200 border-b border-base-content/10 px-4 min-h-0 h-12">
	<div class="flex-1 flex items-center gap-3">
		<span class="text-sm font-bold tracking-tight">タグテーブルエディタ</span>
		<ValidationBadge />
	</div>

	<div class="flex-none flex items-center gap-1">
		<a
			href="https://github.com/a1678991/tag-table-editor"
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-ghost btn-xs mr-1"
			title="GitHub - Contributions welcome!"
		>
			<img src="https://cdn.simpleicons.org/github/white" alt="GitHub" class="w-4 h-4" />
		</a>
		<div class="flex items-center gap-0.5 mr-1">
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={!canUndo()}
				onclick={undo}
				title="元に戻す (Ctrl+Z)"
			>
				↩
			</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={!canRedo()}
				onclick={redo}
				title="やり直す (Ctrl+Shift+Z)"
			>
				↪
			</button>
		</div>
		<button
			type="button"
			class="btn btn-ghost btn-xs"
			class:btn-active={showEditor}
			onclick={() => (showEditor = !showEditor)}
		>
			エディタ
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-xs"
			onclick={() => (templateOpen = true)}
		>
			テンプレート
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-xs text-error"
			onclick={resetTable}
		>
			リセット
		</button>
	</div>
</nav>

<TemplateModal bind:open={templateOpen} />
