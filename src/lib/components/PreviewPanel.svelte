<script lang="ts">
	import { getTable, getTotalTags, addColumn } from "$lib/state.svelte";
	import PreviewColumn from "./PreviewColumn.svelte";
</script>

<div class="flex flex-col h-full">
	<div class="px-3 py-2 border-b border-base-content/10 flex items-center justify-between">
		<h2 class="text-sm font-bold opacity-60">プレビュー</h2>
		<span class="text-xs opacity-40">{getTotalTags()} タグ</span>
	</div>

	<div class="flex-1 overflow-auto p-4">
		<div class="preview-stage bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-xl p-4 min-h-[200px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_0_40px_rgba(15,52,96,0.15)]">
			<div class="flex gap-1.5 items-start">
				{#each getTable().columns as column, colIndex (column)}
					<PreviewColumn {column} {colIndex} totalColumns={getTable().columns.length} />
				{/each}
				<button
					type="button"
					class="add-col-btn min-w-7 px-1 py-2 rounded-md text-base font-medium border border-dashed border-white/15 bg-transparent text-white/25 cursor-pointer transition-all duration-150 self-stretch shrink-0 hover:border-white/40 hover:text-white/60 hover:bg-white/5"
					onclick={addColumn}
					title="カラムを追加"
				>
					+
				</button>
			</div>
		</div>
	</div>
</div>
