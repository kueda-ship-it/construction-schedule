import { useState, useMemo, useCallback } from 'react'
import ControlPanel from './components/ControlPanel'
import CaseCard from './components/CaseCard'
import GanttChart from './components/GanttChart'
import SummaryCard from './components/SummaryCard'
import Footer, { Legend } from './components/Footer'
import SettingsModal from './components/SettingsModal'
import { useProperties } from './hooks/useProperties'
import type { ScheduleConfig } from './types'

// ── 日付ユーティリティ ─────────────────────────────
function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function fmtFull(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function nextWeekday(target: number): Date {
  const today = new Date()
  const diff = ((target - today.getDay()) + 7) % 7 || 7
  return addDays(today, diff)
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

// ── App ───────────────────────────────────────────────
export default function App() {
  const defaultDate = nextWeekday(4)
  const [dateStr, setDateStr] = useState(toISODate(defaultDate))
  const [showSettings, setShowSettings] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Partial<ScheduleConfig>>({})

  const { properties, status: dbStatus, error: dbError, save, remove } = useProperties()

  // DBロード後に最初の物件を自動選択
  const effectiveId = configId ?? properties[0]?.id ?? ''

  const baseConfig = useMemo(
    () => properties.find(p => p.id === effectiveId)?.config ?? null,
    [properties, effectiveId],
  )

  const config = useMemo(
    () => baseConfig ? { ...baseConfig, ...overrides } : null,
    [baseConfig, overrides],
  )

  const handleSelectConfig = useCallback((id: string) => {
    setConfigId(id)
    setOverrides({})
  }, [])

  const handleOverride = useCallback((partial: Partial<ScheduleConfig>) => {
    setOverrides(prev => ({ ...prev, ...partial }))
  }, [])

  const startDate = useMemo(
    () => new Date(dateStr + 'T00:00:00'),
    [dateStr],
  )

  const days = useMemo(
    () => config
      ? Array.from({ length: config.totalCols }, (_, i) => addDays(startDate, i))
      : [],
    [startDate, config],
  )

  const createdDate = fmtFull(new Date())

  return (
    <>
      <ControlPanel
        value={dateStr}
        onChange={setDateStr}
        onOpenSettings={() => setShowSettings(true)}
      />
      <SettingsModal
        open={showSettings}
        currentId={effectiveId}
        currentConfig={config ?? ({} as ScheduleConfig)}
        properties={properties}
        dbStatus={dbStatus}
        dbError={dbError}
        onSelect={handleSelectConfig}
        onOverride={handleOverride}
        onSave={save}
        onDelete={remove}
        onClose={() => setShowSettings(false)}
      />

      {/* ロード中 */}
      {dbStatus === 'loading' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 50px)',
          fontSize: 13, color: '#9a9790', fontFamily: "'DM Mono',monospace",
        }}>
          Turso からデータを読み込んでいます…
        </div>
      )}

      {/* エラー（未設定含む） */}
      {dbStatus === 'error' && (
        <div style={{
          margin: '40px auto', maxWidth: 520, padding: '24px',
          background: '#fdf1f0', border: '1px solid #f5c6c2', borderRadius: 12,
          fontSize: 11, color: '#c0392b', fontFamily: "'DM Mono',monospace", lineHeight: 1.8,
        }}>
          <strong>DB接続エラー</strong><br />
          {dbError}<br /><br />
          <span style={{ color: '#5e5c57' }}>
            .env.local に VITE_TURSO_URL と VITE_TURSO_AUTH_TOKEN を設定してください。<br />
            設定後は開発サーバーを再起動してください（npm run dev）。
          </span>
        </div>
      )}

      {/* メインコンテンツ */}
      {dbStatus === 'ready' && config && (
        <div className="page">
          {/* ヘッダー */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            paddingBottom: 8, borderBottom: '2.5px solid #1b3558', marginBottom: 9,
          }}>
            <div>
              <div style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#9a9790',
                fontFamily: "'DM Mono',monospace", marginBottom: 3,
              }}>
                Construction Process Schedule
              </div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1b3558', lineHeight: 1.25 }}>
                {config.title}
                <span style={{ display: 'block', fontSize: 10, fontWeight: 400, color: '#5e5c57', marginTop: 2 }}>
                  {config.subtitle}
                </span>
              </h1>
            </div>
            <table style={{ fontSize: 10, borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['作成日', createdDate],
                  ['工事番号', config.docNumbers],
                  ['版', config.revision],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '2px 7px', fontSize: 9, fontWeight: 600, color: '#9a9790', letterSpacing: '0.06em', borderRight: '1px solid #d4d0c8', paddingRight: 10 }}>{k}</td>
                    <td style={{ padding: '2px 7px', color: '#5e5c57' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 案件カード */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
            {config.cases.map(c => (
              <CaseCard key={c.id} caseConfig={c} days={days} badgeColor={c.color} />
            ))}
          </div>

          {/* ガントチャート */}
          <GanttChart startDate={startDate} config={config} />

          {/* 凡例 */}
          <Legend config={config} />

          {/* サマリー */}
          <SummaryCard config={config} />

          {/* 備考 */}
          <Footer config={config} createdDate={createdDate} />
        </div>
      )}
    </>
  )
}
