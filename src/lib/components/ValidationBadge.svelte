<script lang="ts">
	import { getTotalTags, getErrors, getHasErrors } from "$lib/state.svelte";

	let totalTags = $derived(getTotalTags());
	let errors = $derived(getErrors());
	let hasErrors = $derived(getHasErrors());
	let warningCount = $derived(errors.filter((e) => e.type === "warning").length);
	let errorCount = $derived(errors.filter((e) => e.type === "error").length);
</script>

<div class="flex items-center gap-1.5">
	<span
		class="badge badge-sm"
		class:badge-success={!hasErrors && totalTags <= 56}
		class:badge-warning={!hasErrors && totalTags > 56}
		class:badge-error={hasErrors}
	>
		{totalTags}/64
	</span>

	{#if errorCount > 0}
		<span class="badge badge-sm badge-error badge-outline">{errorCount} エラー</span>
	{/if}
	{#if warningCount > 0}
		<span class="badge badge-sm badge-warning badge-outline">{warningCount} 警告</span>
	{/if}
</div>
