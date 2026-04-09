import type { CaseConfig, WorkItem } from '../types'

// ── ユーティリティ ──────────────────────────────────
function fmtDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

// ── バッジスタイル ──────────────────────────────────
const CAT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  fics:   { bg: '#dce9f5', color: '#1b4a7a', label: 'F-ics' },
  lock:   { bg: '#ede5f5', color: '#4a2e80', label: 'ロッカー' },
  bike:   { bg: '#fdeede', color: '#7a3a00', label: '自転車' },
  forbid: { bg: '#8b0000', color: '#fff',    label: '規制' },
}

const HEADER_BG: Record<string, string> = {
  blue:  '#2a5c8a',
  green: '#1c4a32',
}

// ── アイテム行 ──────────────────────────────────────
function ItemRow({ item, days }: { item: WorkItem; days: Date[] }) {
  const badge = CAT_BADGE[item.category]
  const dateLabel = item.isDayRange && item.dayFrom != null && item.dayTo != null
    ? `${fmtDate(addDays(days[0], item.dayFrom))}〜${fmtDate(addDays(days[0], item.dayTo))}`
    : fmtDate(addDays(days[0], item.dayIndex))

  const badgeBg = badge.bg

  return (
    <tr style={{ borderBottom: '1px solid #eee' }}>
      <td style={{ padding: '4px 8px', fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#9a9790', width: 20 }}>
        {String(item.id).replace(/\D/g, '').padStart(2, '0')}
      </td>
      <td style={{ padding: '5px 8px', verticalAlign: 'middle', lineHeight: 1.4, background: '#fff' }}>
        <span style={{
          display: 'inline-block',
          fontSize: 8,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 3,
          marginRight: 4,
          background: badge.bg,
          color: badge.color,
          verticalAlign: 'middle',
        }}>
          {badge.label}
        </span>
        <span style={{ fontWeight: 600, fontSize: 10 }}>{item.name}</span>
        {item.note && (
          <span style={{ fontSize: 8.5, color: '#5e5c57', marginLeft: 2 }}>{item.note}</span>
        )}
        {item.stopNote && (
          <div>
            <span style={{
              display: 'inline-block',
              fontSize: 8.5,
              color: '#c0392b',
              background: '#fdecea',
              border: '1px solid #f0a090',
              padding: '1px 5px',
              borderRadius: 3,
              marginTop: 2,
              lineHeight: 1.2,
            }}>
              {item.stopNote}
            </span>
          </div>
        )}
        {item.forbidNote && (
          <div>
            <span style={{
              display: 'inline-block',
              fontSize: 8.5,
              color: '#fff',
              background: '#8b0000',
              border: '1px solid #600000',
              padding: '1px 5px',
              borderRadius: 3,
              marginTop: 2,
              lineHeight: 1.2,
            }}>
              {item.forbidNote}
            </span>
          </div>
        )}
        {item.sharedNote && (
          <div>
            <span style={{
              display: 'inline-block',
              fontSize: 8.5,
              color: '#1a5c8a',
              background: '#dceef8',
              border: '1px solid #a0c8e8',
              padding: '1px 6px',
              borderRadius: 3,
              marginTop: 2,
              lineHeight: 1.4,
            }}>
              {item.sharedNote}
            </span>
          </div>
        )}
      </td>
      <td style={{ padding: '5px 6px', verticalAlign: 'middle', background: '#fff', width: 72 }}>
        <span style={{
          display: 'inline-flex',
          fontSize: 9,
          fontWeight: 700,
          padding: '2px 7px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
          background: badgeBg === '#8b0000' ? '#fdecea' : (item.category === 'forbid' ? '#fdecea' : '#e6eef6'),
          color: item.category === 'forbid' ? '#c0392b' : '#2a5082',
        }}>
          {dateLabel}
        </span>
      </td>
      <td style={{ padding: '5px 6px', verticalAlign: 'middle', background: '#fff', width: 84 }}>
        <span style={{
          display: 'inline-flex',
          fontSize: 9,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
          background: item.labor ? '#e6eef6' : '#f5f5f2',
          color: item.labor ? '#1b3558' : '#9a9790',
          fontFamily: "'DM Mono', monospace",
        }}>
          {item.labor ?? (item.sharedNote ? '合算' : '—')}
        </span>
      </td>
    </tr>
  )
}

// ── CaseCard ─────────────────────────────────────────
interface Props {
  caseConfig: CaseConfig
  days: Date[]
  badgeColor: 'blue' | 'green'
}

export default function CaseCard({ caseConfig, days, badgeColor }: Props) {
  // "2人工×2日" → 2×2=4人工、"3人工" → 3人工
  const totalLabor = caseConfig.items.reduce((sum, item) => {
    if (!item.labor) return sum
    const mRange = item.labor.match(/(\d+)人工[×x](\d+)日/)
    if (mRange) return sum + parseInt(mRange[1]) * parseInt(mRange[2])
    const m = item.labor.match(/(\d+)人工/)
    return m ? sum + parseInt(m[1]) : sum
  }, 0)

  return (
    <div style={{
      border: '1px solid #d4d0c8',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)',
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: '7px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: HEADER_BG[badgeColor],
        color: '#fff',
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          fontWeight: 500,
          background: 'rgba(255,255,255,0.18)',
          padding: '1px 6px',
          borderRadius: 3,
          letterSpacing: '0.06em',
        }}>
          {caseConfig.id}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700 }}>{caseConfig.name}</span>
        {totalLabor > 0 && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 9,
            background: 'rgba(255,255,255,0.15)',
            padding: '1px 8px',
            borderRadius: 10,
            fontFamily: "'DM Mono', monospace",
          }}>
            計{totalLabor}人工
          </span>
        )}
      </div>

      {/* テーブル */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#f7f6f3', borderBottom: '1px solid #d4d0c8' }}>
            <th style={{ padding: '4px 8px', textAlign: 'left', fontSize: 8.5, fontWeight: 700, color: '#9a9790', letterSpacing: '0.08em', width: 24 }}>#</th>
            <th style={{ padding: '4px 8px', textAlign: 'left', fontSize: 8.5, fontWeight: 700, color: '#9a9790', letterSpacing: '0.08em' }}>工程</th>
            <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: 8.5, fontWeight: 700, color: '#9a9790', letterSpacing: '0.08em', width: 72, whiteSpace: 'nowrap' }}>時期</th>
            <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: 8.5, fontWeight: 700, color: '#9a9790', letterSpacing: '0.08em', width: 84, whiteSpace: 'nowrap' }}>人工</th>
          </tr>
        </thead>
        <tbody>
          {caseConfig.items.map(item => (
            <ItemRow key={item.id} item={item} days={days} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
