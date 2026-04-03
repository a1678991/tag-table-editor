<script lang="ts">
	import PreviewPanel from "$lib/components/PreviewPanel.svelte";
	import EditorPanel from "$lib/components/EditorPanel.svelte";
	import JsonPanel from "$lib/components/JsonPanel.svelte";
	import Navbar from "$lib/components/Navbar.svelte";

	let showEditor = $state(false);
</script>

<div class="flex flex-col h-screen">
	<Navbar bind:showEditor />

	<div class="flex-1 flex min-h-0">
		{#if showEditor}
			<div class="w-[35%] border-r border-base-content/10 overflow-hidden">
				<EditorPanel />
			</div>
		{/if}

		<div class="flex-1 border-r border-base-content/10 overflow-hidden">
			<PreviewPanel />
		</div>

		<div class="w-[28%] overflow-hidden">
			<JsonPanel />
		</div>
	</div>
</div>
