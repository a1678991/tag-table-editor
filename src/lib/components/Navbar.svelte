<script lang="ts">
	import { resetTable } from "$lib/state.svelte";
	import ValidationBadge from "./ValidationBadge.svelte";
	import TemplateModal from "./TemplateModal.svelte";

	let {
		showEditor = $bindable(false),
	}: {
		showEditor: boolean;
	} = $props();

	let templateOpen = $state(false);
</script>

<nav class="navbar bg-base-200 border-b border-base-content/10 px-4 min-h-0 h-12">
	<div class="flex-1 flex items-center gap-3">
		<span class="text-sm font-bold tracking-tight">タグテーブルエディタ</span>
		<ValidationBadge />
	</div>

	<div class="flex-none flex items-center gap-1">
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
