# memory.md

## プロジェクト概要
- **プロジェクト名**: construction-schedule
- **目的**: 工事進捗工程表の統合管理システム。複数の案件（物件）ごとの工程をガントチャート形式で可視化し、Turso (SQLite) を用いてデータを永続化する。
- **リポジトリ**: `https://github.com/kueda-ship-it/construction-schedule.git`

## 技術スタック
- **Frontend**: React 18, Vite 6, TypeScript
- **Styling**: Vanilla CSS (一部インラインスタイルを使用), Google Fonts (DM Mono)
- **Database**: Turso (libsql)
- **Build Tool**: Vite

## 主要機能
- **工程管理**: 開始日を基準とした工事工程の管理（ガントチャート表示）。
- **物件（案件）管理**: 物件ごとの設定（タイトル、工事番号、詳細内容）を切り替えて表示。
- **データ永続化**: `useProperties` フックを介して Turso DB に設定を保存、読み込み、削除が可能。
- **設定 UI**: モーダルから物件の選択、新規作成、編集、削除が可能。

## 開発ルール・制約
- **UI/UX**: 既存の「工事進捗工程表」としての専門的かつプレミアムなデザインを維持すること。
- **ドキュメント**: `仕様書.md` および `更新履歴.md` を常に最新状態に保つこと。
- **言語**: ドキュメントおよびコメントは日本語を基本とする。
- **環境変数**: `.env.local` に `VITE_TURSO_URL` と `VITE_TURSO_AUTH_TOKEN` を設定する必要がある。

## 注意事項
- デザインには Google Fonts の `DM Mono` を多用しており、インダストリアルで精緻な印象を与えるように構成されている。
- 工程の計算ロジック（`addDays`, `nextWeekday` 等）は `App.tsx` 内に集約されている。
