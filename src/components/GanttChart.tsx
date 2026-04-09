/**
 * GanttChart.tsx
 *
 * バグ修正点（引き継ぎより）：
 * 1. isWE チェックを while ループ先頭で評価 → 工休列に誤ってバーが描画されない
 * 2. forbid-bar の align-self: center に修正（旧: flex-end）
 */
import { useMemo } from 'react'
import type { GanttEntry, ScheduleConfig } from '../types'
import { isSection } from '../types'

// ── 日付ユーティリティ ─────────────────────────────
function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}
function fmtDate(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`
}
function fmtFull(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土']

// ── バースタイル ──────────────────────────────────
const BAR_STYLES: Record<string, React.CSSProperties> = {
  'fics-a': { background: '#2d6a9f' },
  'fics-b': { background: '#267a52' },
  'lock-a': { background: '#6b4fa0' },
  'lock-b': { background: '#8b6abf' },
  'bike-a': { background: '#c0620a' },
  'stop-bar': { background: '#d64a3a', height: 16, fontSize: 7.5, borderRadius: 3 },
  'forbid-bar': {
    height: 12,
    background: 'repeating-linear-gradient(45deg,#8b0000,#8b0000 8px,#ac1010 8px,#ac1010 16px)',
    borderRadius: 2,
    fontSize: 7.5,
    // FIX: align-self: center（旧コードは flex-end で下寄りになっていた）
    alignSelf: 'center',
    opacity: 0.95,
  },
}

// ── 行ラベル枠線色 ────────────────────────────────
const CAT_BORDER: Record<string, string> = {
  fics:   '#2d6a9f',
  lock:   '#6b4fa0',
  bike:   '#c0620a',
  stop:   '#d64a3a',
  forbid: '#8b0000',
}

// ── ヘッダーセル ──────────────────────────────────
function DayHead({
  day, index, weekendCols, reserveCols,
}: {
  day: Date
  index: number
  weekendCols: number[]
  reserveCols: number[]
}) {
  const isWE = weekendCols.includes(index)
  const isRes = reserveCols.includes(index)

  // 作業日番号（工休・予備日を除いた通し番号）
  const workdaysBefore = Array.from({ length: index }, (_, i) => i)
    .filter(i => !weekendCols.includes(i) && !reserveCols.includes(i)).length
  const dayLabel = isWE ? '工休' : isRes ? '予備日' : `Day ${workdaysBefore + 1}`

  const bg = isWE ? '#fdf1f0' : isRes ? '#f5f5f2' : '#fff'
  const textColor = isWE ? '#c0392b' : '#9a9790'

  return (
    <div style={{
      textAlign: 'center',
      padding: '5px 3px',
      borderRight: '1px solid #e8e5de',
      fontSize: 9,
      fontWeight: 700,
      color: textColor,
      fontFamily: "'DM Mono', monospace",
      background: bg,
      gridColumn: `span 1`,
    }}>
      <span style={{ display: 'block', fontSize: 8, color: textColor, letterSpacing: '0.05em', marginBottom: 1 }}>
        {dayLabel}
      </span>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isWE ? '#c0392b' : '#171715', fontFamily: "'DM Mono', monospace", marginTop: 1 }}>
        {fmtDate(day)}
      </span>
      <span style={{ display: 'block', fontSize: 8.5, color: isWE ? '#c0392b' : '#5e5c57', fontFamily: "'Noto Sans JP', sans-serif", marginTop: 1 }}>
        （{DAYS_JP[day.getDay()]}）
      </span>
    </div>
  )
}

// ── ガントセル（バー含む）───────────────────────────
function GanttRow({
  entry,
  days,
  weekendSet,
  reserveSet,
  labelWidth,
}: {
  entry: GanttEntry
  days: Date[]
  weekendSet: Set<number>
  reserveSet: Set<number>
  labelWidth: number
}) {
  if (isSection(entry)) {
    return (
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        color: entry.isStopSec ? '#4a5a6a' : '#fff',
        background: entry.isStopSec ? '#f0f2f5' : '#1b3558',
        borderBottom: entry.isStopSec ? '1.5px solid #d0d8e0' : '2px solid #3a6090',
        borderTop: entry.isStopSec ? '1.5px solid #d0d8e0' : '2px solid #3a6090',
        padding: '6px 14px',
        gridColumn: '1 / -1',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: entry.isStopSec ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>
        <span style={{
          display: 'inline-block',
          width: entry.isStopSec ? 3 : 5,
          height: entry.isStopSec ? 10 : 16,
          background: entry.isStopSec ? '#4a5a6a' : '#7ab3e0',
          borderRadius: 2,
          flexShrink: 0,
        }} />
        {entry.section}
      </div>
    )
  }

  // バーマップ
  const barMap: Record<number, typeof entry.bars[0]> = {}
  entry.bars.forEach(b => { barMap[b.col] = b })

  const cells: React.ReactNode[] = []
  let ci = 0
  const total = days.length

  while (ci < total) {
    const isWE = weekendSet.has(ci)
    const isRes = reserveSet.has(ci)
    const cellBg = isWE
      ? 'repeating-linear-gradient(135deg,#f7eeec,#f7eeec 3px,#fdf3f2 3px,#fdf3f2 9px)'
      : isRes
        ? 'repeating-linear-gradient(135deg,#f0f0ec,#f0f0ec 3px,#f8f8f6 3px,#f8f8f6 9px)'
        : '#fff'

    // バー判定を先行 — 工休列スタートのバー（荷物入庫停止等）も正しく描画するため
    const bar = barMap[ci]
    if (bar) {
      const span = bar.span || 1
      const barStyle: React.CSSProperties = {
        height: 20,
        borderRadius: 4,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        fontSize: 8,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '0.02em',
        position: 'relative',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        opacity: 0.88,
        zIndex: 10,
        ...BAR_STYLES[bar.cls],
      }

      // 人工数をバッジとして分離（例: "受信機 3人工" → main="受信機" labor="3人工"）
      const laborMatch = bar.text.match(/^(.*?)(\d+人工(?:[×x]\d+日)?)$/)
      const mainText = laborMatch ? laborMatch[1].trim() : bar.text
      const laborText = laborMatch ? laborMatch[2] : null

      const spannedCols = Array.from({ length: span }, (_, k) => ci + k)
      const crossesWeekend = spannedCols.some(c => weekendSet.has(c))

      if (crossesWeekend) {
        // 列単位レンダリング：工休=縞背景、平日=白背景
        // 横パディングゼロ＋先頭/末尾のみ角丸でバーを連続して見せる
        let labelShown = false
        spannedCols.forEach((col, k) => {
          const colIsWE = weekendSet.has(col)
          const isFirst = k === 0
          const isLast = k === spannedCols.length - 1
          const bg = colIsWE
            ? 'repeating-linear-gradient(135deg,#f7eeec,#f7eeec 3px,#fdf3f2 3px,#fdf3f2 9px)'
            : '#fff'
          const showLabel = !labelShown && !colIsWE
          // 先頭/末尾以外はborderRadiusなし、バーが途切れない
          const colBarRadius = isFirst && isLast ? undefined
            : isFirst ? '2px 0 0 2px'
            : isLast  ? '0 2px 2px 0'
            : '0'
          cells.push(
            <div key={col} style={{
              borderBottom: '1px solid #e8e5de',
              borderRight: isLast ? '1px solid #e8e5de' : 'none',
              padding: '4px 0', // 横パディングゼロ
              display: 'flex',
              alignItems: 'center',
              minHeight: 32,
              background: bg,
            }}>
              <div style={{ ...barStyle, borderRadius: colBarRadius, fontSize: showLabel ? 8 : 0 }}>
                {showLabel && mainText && <span>{mainText}</span>}
                {showLabel && laborText && (
                  <span style={{
                    background: 'rgba(255,255,255,0.92)',
                    color: '#1b3558',
                    padding: '1px 5px',
                    borderRadius: 8,
                    fontSize: 7.5,
                    fontWeight: 800,
                    letterSpacing: 0,
                    flexShrink: 0,
                  }}>
                    {laborText}
                  </span>
                )}
              </div>
            </div>,
          )
          if (!colIsWE) labelShown = true
        })
      } else {
        cells.push(
          <div key={ci} style={{
            gridColumn: `span ${span}`,
            borderBottom: '1px solid #e8e5de',
            borderRight: '1px solid #e8e5de',
            padding: '4px 2px',
            display: 'flex',
            alignItems: 'center',
            minHeight: 32,
            background: '#fff',
          }}>
            <div style={barStyle}>
              {mainText && <span>{mainText}</span>}
              {laborText && (
                <span style={{
                  background: 'rgba(255,255,255,0.92)',
                  color: '#1b3558',
                  padding: '1px 5px',
                  borderRadius: 8,
                  fontSize: 7.5,
                  fontWeight: 800,
                  letterSpacing: 0,
                  flexShrink: 0,
                }}>
                  {laborText}
                </span>
              )}
            </div>
          </div>,
        )
      }
      ci += span
    } else {
      cells.push(
        <div key={ci} style={{
          borderBottom: '1px solid #e8e5de',
          borderRight: '1px solid #e8e5de',
          padding: '4px 2px',
          display: 'flex',
          alignItems: 'center',
          minHeight: 32,
          background: cellBg,
        }} />,
      )
      ci++
    }
  }

  return (
    <>
      <div style={{
        padding: '4px 9px',
        borderBottom: '1px solid #e8e5de',
        borderRight: '1px solid #d4d0c8',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 32,
        minWidth: labelWidth,
        maxWidth: labelWidth,
        borderLeft: `3px solid ${CAT_BORDER[entry.cat] ?? '#ccc'}`,
      }}>
        <span style={{
          fontSize: 9.5,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          color: (entry.cat === 'stop' || entry.cat === 'forbid') ? '#c0392b' : 'inherit',
        }}>
          {entry.label}
        </span>
        {entry.sub && (
          <span style={{ fontSize: 8, color: '#5e5c57', marginTop: 1 }}>{entry.sub}</span>
        )}
      </div>
      {cells}
    </>
  )
}

// ── GanttChart ────────────────────────────────────────
interface Props {
  startDate: Date
  config: ScheduleConfig
}

export default function GanttChart({ startDate, config }: Props) {
  const { totalCols, weekendCols, reserveCols, ganttRows } = config

  const days = useMemo(
    () => Array.from({ length: totalCols }, (_, i) => addDays(startDate, i)),
    [startDate, totalCols],
  )

  const weekendSet = useMemo(() => new Set(weekendCols), [weekendCols])
  const reserveSet = useMemo(() => new Set(reserveCols), [reserveCols])

  const LABEL_W = 168
  // 工休列は 0.5fr、予備日は 0.9fr、通常は 1fr
  const colFrs = days.map((_, i) =>
    weekendSet.has(i) ? '0.5fr' : reserveSet.has(i) ? '0.9fr' : '1fr',
  )
  const gridCols = `${LABEL_W}px ${colFrs.join(' ')}`

  return (
    <div style={{
      border: '1px solid #d4d0c8',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)',
      marginBottom: 9,
    }}>
      {/* タイトルバー */}
      <div style={{
        background: '#374955',
        color: '#fff',
        padding: '7px 13px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        施工ガントチャート
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>
          {fmtFull(days[0])} 〜 {fmtFull(days[totalCols - 1])}
        </span>
      </div>

      {/* ヘッダー行 */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, width: '100%', borderBottom: '1px solid #d4d0c8', background: '#fff' }}>
        <div style={{ minWidth: LABEL_W, borderRight: '1px solid #d4d0c8' }} />
        {days.map((d, i) => (
          <DayHead
            key={i}
            day={d}
            index={i}
            weekendCols={weekendCols}
            reserveCols={reserveCols}
          />
        ))}
      </div>

      {/* ガント行 */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, width: '100%' }}>
        {ganttRows.map((entry, idx) => (
          <GanttRow
            key={idx}
            entry={entry}
            days={days}
            weekendSet={weekendSet}
            reserveSet={reserveSet}
            labelWidth={LABEL_W}
          />
        ))}
      </div>
    </div>
  )
}
