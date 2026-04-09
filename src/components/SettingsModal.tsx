import { useState, useEffect, useCallback } from 'react'
import type { ScheduleConfig } from '../types'
import type { PropertyEntry, DbStatus } from '../hooks/useProperties'

interface Props {
  open: boolean
  currentId: string
  currentConfig: ScheduleConfig
  properties: PropertyEntry[]
  dbStatus: DbStatus
  dbError: string | null
  onSelect: (id: string) => void
  onOverride: (overrides: Partial<ScheduleConfig>) => void
  onSave: (id: string, label: string, desc: string, config: ScheduleConfig) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

// ── アイコン ──────────────────────────────────────────
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const IconSave = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
)
const IconDatabase = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

export default function SettingsModal({
  open, currentId, currentConfig, properties, dbStatus, dbError,
  onSelect, onOverride, onSave, onDelete, onClose,
}: Props) {
  const [tab, setTab] = useState<'property' | 'params'>('property')
  const [costStr, setCostStr] = useState(String(currentConfig.totalCost))
  const [revStr, setRevStr] = useState(currentConfig.revision)
  const [docStr, setDocStr] = useState(currentConfig.docNumbers)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setCostStr(String(currentConfig.totalCost))
    setRevStr(currentConfig.revision)
    setDocStr(currentConfig.docNumbers)
  }, [currentId, currentConfig])

  // 現在の設定をDBに保存
  const handleSaveCurrent = useCallback(async () => {
    setSaving(true)
    try {
      const entry = properties.find(p => p.id === currentId)
      if (!entry) return
      const cost = parseInt(costStr.replace(/,/g, ''), 10)
      const merged: ScheduleConfig = {
        ...currentConfig,
        totalCost: isNaN(cost) ? currentConfig.totalCost : cost,
        revision: revStr.trim() || currentConfig.revision,
        docNumbers: docStr.trim() || currentConfig.docNumbers,
      }
      await onSave(currentId, entry.label, entry.description, merged)
      onOverride({})
    } finally {
      setSaving(false)
    }
  }, [costStr, revStr, docStr, currentId, currentConfig, properties, onSave, onOverride])

  // 物件削除
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(`「${properties.find(p => p.id === id)?.label}」を削除しますか？`)) return
    setDeletingId(id)
    try {
      await onDelete(id)
      if (id === currentId && properties.length > 1) {
        const next = properties.find(p => p.id !== id)
        if (next) onSelect(next.id)
      }
    } finally {
      setDeletingId(null)
    }
  }, [properties, currentId, onDelete, onSelect])

  const handleApply = useCallback(() => {
    const cost = parseInt(costStr.replace(/,/g, ''), 10)
    onOverride({
      totalCost: isNaN(cost) ? currentConfig.totalCost : cost,
      revision: revStr.trim() || currentConfig.revision,
      docNumbers: docStr.trim() || currentConfig.docNumbers,
    })
    onClose()
  }, [costStr, revStr, docStr, currentConfig, onOverride, onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(10,18,35,0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 580, maxWidth: '92vw',
        background: 'linear-gradient(160deg, #ffffff 0%, #f7f5f0 100%)',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        animation: 'fadeIn 0.18s ease',
      }}>
        {/* ヘッダー */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1a2e 0%, #162d50 100%)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Mono',monospace", marginBottom: 3 }}>
              SETTINGS
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>工程表の設定</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* DB接続ステータス */}
            <DbBadge status={dbStatus} />
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8, color: 'rgba(255,255,255,0.7)',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e8e5de', background: '#fafaf8' }}>
          {([['property', '物件選択'], ['params', 'パラメータ上書き']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '10px 20px', fontSize: 11, fontWeight: 700,
              color: tab === key ? '#1b3558' : '#9a9790',
              borderBottom: tab === key ? '2px solid #1b3558' : '2px solid transparent',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.05em',
              fontFamily: "'Noto Sans JP',sans-serif",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* 本体 */}
        <div style={{ padding: '18px 20px 0', minHeight: 240, maxHeight: '60vh', overflowY: 'auto' }}>

          {/* エラー表示 */}
          {dbStatus === 'error' && dbError && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 14,
              background: '#fdf1f0', border: '1px solid #f5c6c2',
              fontSize: 10, color: '#c0392b', fontFamily: "'DM Mono',monospace",
            }}>
              DB接続エラー: {dbError}
            </div>
          )}

          {/* ── 物件選択タブ ── */}
          {tab === 'property' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
              {dbStatus === 'loading' && (
                <div style={{ padding: 20, textAlign: 'center', color: '#9a9790', fontSize: 11 }}>
                  読み込み中…
                </div>
              )}
              {properties.map(entry => {
                const selected = entry.id === currentId
                return (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 14px', borderRadius: 10,
                    border: selected ? '2px solid #1b3558' : '2px solid #e8e5de',
                    background: selected
                      ? 'linear-gradient(135deg,#eef3f9,#e4edf6)'
                      : 'linear-gradient(135deg,#fafaf8,#f4f2ed)',
                    boxShadow: selected ? '0 2px 8px rgba(27,53,88,0.12)' : 'none',
                  }}>
                    <button onClick={() => onSelect(entry.id)} style={{
                      flex: 1, textAlign: 'left', background: 'none', border: 'none',
                      cursor: 'pointer', padding: 0,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: selected ? '#1b3558' : '#3a3830', marginBottom: 3 }}>
                        {entry.label}
                      </div>
                      <div style={{ fontSize: 9.5, color: selected ? '#4a6d9c' : '#9a9790', fontFamily: "'DM Mono',monospace" }}>
                        {entry.description}
                      </div>
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {selected && <span style={{ color: '#1b3558' }}><IconCheck /></span>}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id || properties.length <= 1}
                        title="削除"
                        style={{
                          background: 'none', border: '1px solid #e8e5de',
                          borderRadius: 6, padding: '4px 6px',
                          color: '#c0392b', cursor: 'pointer',
                          opacity: properties.length <= 1 ? 0.3 : 1,
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                        }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                )
              })}

              <div style={{
                padding: '10px 14px', borderRadius: 10,
                border: '2px dashed #d4d0c8', background: 'transparent',
                fontSize: 10, color: '#b0ada6', fontFamily: "'DM Mono',monospace",
              }}>
                + 新物件追加: src/config/ にファイル作成 → index.ts の CONFIG_LIST に登録 → 再起動時に自動シード
              </div>
            </div>
          )}

          {/* ── パラメータ上書きタブ ── */}
          {tab === 'params' && (
            <div>
              <div style={{ fontSize: 9, color: '#9a9790', marginBottom: 14, lineHeight: 1.6 }}>
                DBに保存せず画面上のみ変更する場合は「適用」、DBに永続保存する場合は「DBに保存」を使用します。
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <Field label="人工費合計（円）" value={costStr} onChange={setCostStr} placeholder="880000" mono />
                <Field label="工事番号" value={docStr} onChange={setDocStr} placeholder="42111 / 42101" mono />
                <Field label="版" value={revStr} onChange={setRevStr} placeholder="Rev. 1.8" mono />
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid #e8e5de',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fafaf8',
        }}>
          <div style={{ fontSize: 9, color: '#9a9790', fontFamily: "'DM Mono',monospace" }}>
            {dbStatus === 'ready' ? `${properties.length}件の物件` : ''}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{
              padding: '8px 18px', borderRadius: 8,
              border: '1px solid #d4d0c8', background: 'linear-gradient(135deg,#fff,#f5f3ee)',
              fontSize: 11, fontWeight: 600, color: '#5e5c57',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'Noto Sans JP',sans-serif",
            }}>
              キャンセル
            </button>
            {tab === 'params' && (
              <button onClick={handleSaveCurrent} disabled={saving || dbStatus !== 'ready'} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 18px', borderRadius: 8,
                border: '1px solid #2a7a52',
                background: 'linear-gradient(135deg,#2a7a52,#1e6040)',
                fontSize: 11, fontWeight: 700, color: '#fff',
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: "'Noto Sans JP',sans-serif",
                opacity: saving || dbStatus !== 'ready' ? 0.6 : 1,
              }}>
                <IconSave />{saving ? '保存中…' : 'DBに保存'}
              </button>
            )}
            <button onClick={handleApply} style={{
              padding: '8px 22px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#1b3558,#2a5082)',
              fontSize: 11, fontWeight: 700, color: '#fff',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'Noto Sans JP',sans-serif",
              boxShadow: '0 2px 8px rgba(27,53,88,0.25)',
            }}>
              適用
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

// ── サブコンポーネント ─────────────────────────────────
function DbBadge({ status }: { status: DbStatus }) {
  const map: Record<DbStatus, { label: string; color: string; bg: string }> = {
    idle:    { label: 'DB', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.08)' },
    loading: { label: '接続中…', color: '#f0c040', bg: 'rgba(240,192,64,0.15)' },
    ready:   { label: 'DB接続済', color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
    error:   { label: 'DB未接続', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  }
  const s = map[status]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, border: `1px solid ${s.color}33`,
      fontSize: 9, fontWeight: 700, color: s.color,
      fontFamily: "'DM Mono',monospace", letterSpacing: '0.05em',
    }}>
      <IconDatabase />
      {s.label}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean
}) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 600, color: '#9a9790', marginBottom: 5 }}>{label}</div>
      <input
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '7px 10px',
          border: '1.5px solid #d4d0c8', borderRadius: 7, fontSize: 11,
          fontFamily: mono ? "'DM Mono',monospace" : "'Noto Sans JP',sans-serif",
          color: '#1b3558', background: '#fff', outline: 'none', transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = '#1b3558')}
        onBlur={e => (e.target.style.borderColor = '#d4d0c8')}
      />
    </div>
  )
}
