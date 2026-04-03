<script lang="ts">
	import { loadTemplate } from "$lib/state.svelte";
	import { TEMPLATES } from "$lib/templates";

	let { open = $bindable(false) }: { open: boolean } = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (open) {
			dialog?.showModal();
		} else {
			dialog?.close();
		}
	});

	function handleSelect(key: string) {
		loadTemplate(key);
		open = false;
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={() => (open = false)}>
	<div class="modal-box">
		<h3 class="text-lg font-bold mb-4">テンプレートを選択</h3>
		<p class="text-xs opacity-50 mb-4">
			現在の内容は上書きされます。
		</p>

		<div class="space-y-2">
			{#each Object.entries(TEMPLATES) as [key, tmpl] (key)}
				<button
					type="button"
					class="btn btn-outline btn-block justify-start"
					onclick={() => handleSelect(key)}
				>
					{tmpl.name}
					<span class="badge badge-sm badge-ghost ml-auto">
						{tmpl.data.columns.reduce((s, c) => s + c.cells.length, 0)} タグ
					</span>
				</button>
			{/each}
		</div>

		<div class="modal-action">
			<button type="button" class="btn btn-ghost" onclick={() => (open = false)}>
				キャンセル
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button type="submit">close</button>
	</form>
</dialog>
