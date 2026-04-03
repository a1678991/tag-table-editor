<script lang="ts">
	import PreviewPanel from "$lib/components/PreviewPanel.svelte";
	import EditorPanel from "$lib/components/EditorPanel.svelte";
	import JsonPanel from "$lib/components/JsonPanel.svelte";
	import Navbar from "$lib/components/Navbar.svelte";
</script>

<div class="flex flex-col h-screen">
	<Navbar />

	<div class="flex-1 flex min-h-0">
		<div class="w-[40%] border-r border-base-content/10 overflow-hidden">
			<EditorPanel />
		</div>
		<div class="w-[35%] border-r border-base-content/10 overflow-hidden">
			<PreviewPanel />
		</div>
		<div class="w-[25%] overflow-hidden">
			<JsonPanel />
		</div>
	</div>
</div>
