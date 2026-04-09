/**
 * Turso (libSQL) クライアント
 * ブラウザから直接接続（内部ツール用）
 *
 * 必要な環境変数:
 *   VITE_TURSO_URL        例: libsql://my-db.turso.io
 *   VITE_TURSO_AUTH_TOKEN Turso管理画面で発行したトークン
 */
import { createClient } from '@libsql/client/web'
import type { Client } from '@libsql/client'
import type { ScheduleConfig } from '../types'

// ── DB行の型 ──────────────────────────────────────────
export interface PropertyRow {
  id: string
  label: string
  description: string
  config_json: string
  created_at: string
  updated_at: string
}

export interface PropertyEntry {
  id: string
  label: string
  description: string
  config: ScheduleConfig
  createdAt: string
  updatedAt: string
}

// ── シングルトンクライアント ───────────────────────────
let _client: Client | null = null

export function getClient(): Client {
  if (!_client) {
    const url = import.meta.env.VITE_TURSO_URL
    const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN
    if (!url || !authToken) {
      throw new Error('VITE_TURSO_URL / VITE_TURSO_AUTH_TOKEN が未設定です。.env.local を確認してください。')
    }
    _client = createClient({ url, authToken })
  }
  return _client
}

// ── マイグレーション（初回のみ実行）───────────────────
export async function migrate(): Promise<void> {
  const db = getClient()
  await db.execute(`
    CREATE TABLE IF NOT EXISTS properties (
      id          TEXT PRIMARY KEY,
      label       TEXT NOT NULL,
      description TEXT NOT NULL,
      config_json TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

// ── CRUD ─────────────────────────────────────────────
function rowToEntry(row: Record<string, unknown>): PropertyEntry {
  return {
    id: String(row.id),
    label: String(row.label),
    description: String(row.description),
    config: JSON.parse(String(row.config_json)) as ScheduleConfig,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export async function listProperties(): Promise<PropertyEntry[]> {
  const db = getClient()
  const res = await db.execute('SELECT * FROM properties ORDER BY created_at ASC')
  return res.rows.map(r => rowToEntry(r as Record<string, unknown>))
}

export async function getProperty(id: string): Promise<PropertyEntry | null> {
  const db = getClient()
  const res = await db.execute({
    sql: 'SELECT * FROM properties WHERE id = ?',
    args: [id],
  })
  if (res.rows.length === 0) return null
  return rowToEntry(res.rows[0] as Record<string, unknown>)
}

export async function upsertProperty(
  id: string,
  label: string,
  description: string,
  config: ScheduleConfig,
): Promise<void> {
  const db = getClient()
  await db.execute({
    sql: `
      INSERT INTO properties (id, label, description, config_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        label       = excluded.label,
        description = excluded.description,
        config_json = excluded.config_json,
        updated_at  = datetime('now')
    `,
    args: [id, label, description, JSON.stringify(config)],
  })
}

export async function deleteProperty(id: string): Promise<void> {
  const db = getClient()
  await db.execute({ sql: 'DELETE FROM properties WHERE id = ?', args: [id] })
}

export async function countProperties(): Promise<number> {
  const db = getClient()
  const res = await db.execute('SELECT COUNT(*) as cnt FROM properties')
  return Number((res.rows[0] as Record<string, unknown>).cnt)
}
