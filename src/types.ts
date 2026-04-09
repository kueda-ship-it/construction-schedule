// ── ガントバー ──────────────────────────────────────
export interface GanttBar {
  col: number
  span: number
  cls: BarClass
  text: string
}

export type BarClass =
  | 'fics-a'
  | 'fics-b'
  | 'lock-a'
  | 'lock-b'
  | 'bike-a'
  | 'stop-bar'
  | 'forbid-bar'

// ── ガント行 ─────────────────────────────────────────
export type RowCategory = 'fics' | 'lock' | 'bike' | 'stop' | 'forbid'

export interface GanttSection {
  section: string
  isStopSec?: boolean
}

export interface GanttRow {
  label: string
  sub?: string
  cat: RowCategory
  bars: GanttBar[]
}

export type GanttEntry = GanttSection | GanttRow

export function isSection(entry: GanttEntry): entry is GanttSection {
  return 'section' in entry
}

// ── 工程表アイテム（案件カード用）────────────────────
export type ItemCategory = 'fics' | 'lock' | 'bike' | 'forbid'

export interface WorkItem {
  id: string
  category: ItemCategory
  name: string
  note?: string
  stopNote?: string
  forbidNote?: string
  sharedNote?: string
  /** days[dayIndex] を表示 */
  dayIndex: number
  /** trueの場合 days[dayFrom]〜days[dayTo] を表示 */
  isDayRange?: boolean
  dayFrom?: number
  dayTo?: number
  labor: string | null
}

// ── 案件（物件）─────────────────────────────────────
export type CaseColor = 'blue' | 'green'

export interface CaseConfig {
  id: string
  name: string
  color: CaseColor
  items: WorkItem[]
}

// ── 凡例 ──────────────────────────────────────────────
export interface LegendItem {
  cls: string
  label: string
  isPattern?: boolean
}

// ── スケジュール全体設定 ──────────────────────────────
export interface ScheduleConfig {
  /** ページタイトル */
  title: string
  /** サブタイトル（物件名など） */
  subtitle: string
  /** 工事番号表示文字列 */
  docNumbers: string
  /** バージョン文字列 */
  revision: string
  /** 人工費合計（円） */
  totalCost: number
  /** ガントの総列数（通常9） */
  totalCols: number
  /** 工休列インデックス（0始まり）*/
  weekendCols: number[]
  /** 予備日列インデックス */
  reserveCols: number[]
  /** 案件リスト */
  cases: CaseConfig[]
  /** ガント行リスト */
  ganttRows: GanttEntry[]
  /** 凡例 */
  legend: LegendItem[]
  /** 備考行 */
  remarks: string[]
}
