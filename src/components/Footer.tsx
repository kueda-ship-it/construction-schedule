import type { ScheduleConfig } from '../types'

interface Props {
  config: ScheduleConfig
  createdDate: string
}

const BAR_COLOR: Record<string, React.CSSProperties> = {
  'fics-a':     { background: '#2d6a9f' },
  'fics-b':     { background: '#267a52' },
  'lock-a':     { background: '#6b4fa0' },
  'lock-b':     { background: '#8b6abf' },
  'bike-a':     { background: '#c0620a' },
  'stop-bar':   { background: '#d64a3a' },
  'forbid-bar': {
    background: 'repeating-linear-gradient(45deg,#6b0000,#6b0000 3px,#9b1010 3px,#9b1010 6px)',
  },
  'reserve':    { background: '#607080' },
}

// ── 凡例（横一列、サマリー上用）─────────────────────
export function Legend({ config }: { config: ScheduleConfig }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'nowrap',
      gap: '4px 14px',
      padding: '6px 0',
      marginBottom: 6,
      overflowX: 'auto',
    }}>
      {config.legend.map((li, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: '#5e5c57', whiteSpace: 'nowrap' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, flexShrink: 0, ...BAR_COLOR[li.cls] }} />
          {li.label}
        </div>
      ))}
    </div>
  )
}

// ── 備考フッター ────────────────────────────
export default function Footer({ config, createdDate }: Props) {
  return (
    <>
      {/* 備考 */}
      <div style={{
        borderLeft: '3.5px solid #a07c10',
        padding: '6px 11px',
        fontSize: 9,
        color: '#5e5c57',
        lineHeight: 1.75,
        marginBottom: 7,
      }}>
        <strong style={{ display: 'block', fontSize: 8.5, fontWeight: 700, color: '#9a9790', marginBottom: 3 }}>
          備考 / Notes
        </strong>
        {config.remarks.map((r, i) => (
          <span key={i}>{r}<br /></span>
        ))}
      </div>

      {/* フッター */}
      <div style={{
        paddingTop: 5,
        borderTop: '1px solid #d4d0c8',
        fontSize: 8,
        color: '#9a9790',
        fontFamily: "'DM Mono', monospace",
      }}>
        CONFIDENTIAL — 本資料は関係者限りの資料です
      </div>

      <div style={{ display: 'none' }}>{createdDate}</div>
    </>
  )
}
