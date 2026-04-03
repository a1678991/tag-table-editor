<script lang="ts">
	import { serializeJson, importJson } from "$lib/state.svelte";

	let json = $derived(serializeJson());
	let importText = $state("");
	let importMode = $state(false);
	let importError = $state("");
	let copyFeedback = $state(false);

	async function handleCopy() {
		await navigator.clipboard.writeText(json);
		copyFeedback = true;
		setTimeout(() => (copyFeedback = false), 1500);
	}

	function handleDownload() {
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "tag-table.json";
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImportSubmit() {
		const result = importJson(importText);
		if (result.ok) {
			importMode = false;
			importText = "";
			importError = "";
		} else {
			importError = result.error ?? "不明なエラー";
		}
	}

	function handleFileImport(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result as string;
			const result = importJson(text);
			if (!result.ok) {
				importError = result.error ?? "不明なエラー";
				importMode = true;
				importText = text;
			}
		};
		reader.readAsText(file);
	}
</script>

<div class="flex flex-col h-full">
	<div class="px-3 py-2 border-b border-base-content/10 flex items-center justify-between">
		<h2 class="text-sm font-bold opacity-60">JSON</h2>
		<div class="flex gap-1">
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				class:btn-success={copyFeedback}
				onclick={handleCopy}
			>
				{copyFeedback ? "OK!" : "コピー"}
			</button>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				onclick={handleDownload}
			>
				保存
			</button>
			<label class="btn btn-ghost btn-xs">
				読込
				<input
					type="file"
					accept=".json"
					class="hidden"
					onchange={handleFileImport}
				/>
			</label>
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				class:btn-active={importMode}
				onclick={() => (importMode = !importMode)}
			>
				貼付
			</button>
		</div>
	</div>

	{#if importMode}
		<div class="p-3 border-b border-base-content/10 space-y-2">
			<textarea
				class="textarea textarea-bordered w-full text-xs font-mono"
				rows="6"
				placeholder="JSONを貼り付け..."
				bind:value={importText}
			></textarea>
			{#if importError}
				<p class="text-xs text-error">{importError}</p>
			{/if}
			<button
				type="button"
				class="btn btn-primary btn-xs btn-block"
				onclick={handleImportSubmit}
			>
				インポート
			</button>
		</div>
	{/if}

	<div class="flex-1 overflow-auto p-3">
		<pre class="text-[10px] font-mono opacity-70 whitespace-pre-wrap break-all">{json}</pre>
	</div>
</div>
