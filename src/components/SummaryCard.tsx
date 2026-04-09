import type { ScheduleConfig } from '../types'

interface Props {
  config: ScheduleConfig
}

export default function SummaryCard({ config }: Props) {
  const totalLabor = config.cases.reduce((sum, c) => {
    return sum + c.items.reduce((s, item) => {
      if (!item.labor) return s
      const mRange = item.labor.match(/(\d+)人工[×x](\d+)日/)
      if (mRange) return s + parseInt(mRange[1]) * parseInt(mRange[2])
      const m = item.labor.match(/(\d+)人工/)
      return m ? s + parseInt(m[1]) : s
    }, 0)
  }, 0)

  const unitPrice = totalLabor > 0 ? Math.ceil(config.totalCost / totalLabor) : 0

  return (
    <div style={{
      border: '1px solid #d4d0c8',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)',
      marginBottom: 9,
    }}>
      <div style={{
        background: '#1c4a32',
        color: '#fff',
        padding: '6px 12px',
        fontSize: 10,
        fontWeight: 700,
      }}>
        工事サマリー（両案件合計）
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#fff' }}>
        <SummaryItem label="総人工数" value={`${totalLabor}`} unit="人工" />
        <SummaryItem label="人工単価" value={unitPrice.toLocaleString()} unit="円 / 人工" />
        <SummaryItem label="人工費合計" value={config.totalCost.toLocaleString()} unit="円（税別）" last />
      </div>
    </div>
  )
}

function SummaryItem({ label, value, unit, last }: {
  label: string
  value: string
  unit: string
  last?: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      borderRight: last ? 'none' : '1px solid #e8e5de',
      background: '#fff',
    }}>
      <span style={{
        fontSize: 8.5,
        fontWeight: 700,
        color: '#9a9790',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 15,
        fontWeight: 700,
        color: '#1b3558',
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.02em',
      }}>
        {value}
      </span>
      <span style={{ fontSize: 9, color: '#5e5c57', whiteSpace: 'nowrap' }}>
        {unit}
      </span>
    </div>
  )
}
