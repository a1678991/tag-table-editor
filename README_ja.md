# タグテーブルエディタ

VRChat ミートアップワールド用のタグテーブルをブラウザ上でデザインするビジュアルエディタです。

ミートアップ主催者がカラフルなタグボタンのレイアウトを作成し、VRChat での見た目をプレビューしてから、JSON を Unity エンジニアに渡せます。

[English](README.md)

## 機能

- **プレビュー上で直接編集** — セルをクリックで色変更、ダブルクリックでテキスト編集
- **ドラッグ＆ドロップ** — セルをカラム内・カラム間で並べ替え
- **複数タグセット** — 名前付きタブで複数のタグテーブルを管理
- **元に戻す / やり直す** — Ctrl+Z / Ctrl+Shift+Z（100 ステップ履歴）
- **自動保存** — localStorage に自動的に保存
- **JSON エクスポート** — クリップボードにコピーまたは `.json` ファイルとしてダウンロード
- **バリデーション** — 64 タグ上限に近づくと警告表示
- **JSON Schema** — エディタ補完用の `tag-table.schema.json` を同梱

## はじめかた

### 必要なもの

- [mise](https://mise.jdx.dev/)（bun, node などのツールを自動インストール）

### セットアップ

```bash
mise install
bun install
```

### 開発

```bash
bun run dev       # 開発サーバー起動（localhost:5173）
bun run build     # プロダクションビルド
bun run test      # Playwright e2e テスト実行
bun run lint      # oxlint + eslint 実行
bun run fmt       # oxfmt でフォーマット
```

## JSON 出力フォーマット

Unity の [YodoTagBuilder](https://github.com/a1678991/InfraWorld) で読み込める JSON を出力します：

```json
{
  "column_width": 0.45,
  "columns": [
    {
      "cells": [
        { "text": "フロントエンド", "text_color": "#FFFFFF", "bg_color": "#14505C" },
        { "text": "バックエンド", "text_color": "#FFFFFF", "bg_color": "#14505C" }
      ]
    }
  ]
}
```

タグ数は全カラム合計で最大 64 個。色は `#RRGGBB` または `#RRGGBBAA` 形式。

## 技術スタック

Svelte 5 / SvelteKit / Tailwind CSS 4 / DaisyUI 5 / Playwright / Bun

## ライセンス

[MIT](LICENSE)
