/**
 * プラウド新浦安ベイサイドフォート（42111）
 * プラウド新浦安パークサイドフォート（42101）
 * 工事工程表 設定ファイル
 *
 * 別物件への流用：このファイルをコピーして値を書き換えるだけでOK。
 */
import type { ScheduleConfig } from '../types'

const config: ScheduleConfig = {
  title:
    'F-icsリニューアル・ロッカーリニューアル・自転車入替　工事工程表',
  subtitle:
    'プラウド新浦安ベイサイドフォート（42111）／プラウド新浦安パークサイドフォート（42101）',
  docNumbers: '42111 / 42101',
  revision: 'Rev. 1.8 (v4.11)',

  // ── 費用 ──────────────────────────────────────────
  // 880,000円 ÷ 13人工 = 67,692円/人工（端数切り上げ）
  totalCost: 880_000,

  // ── ガント設定 ────────────────────────────────────
  totalCols: 9,
  weekendCols: [2, 3], // 工休（土日）
  reserveCols: [8],    // 予備日

  // ── 案件カード ────────────────────────────────────
  cases: [
    {
      id: '42111',
      name: 'プラウド新浦安ベイサイドフォート',
      color: 'blue',
      items: [
        {
          id: 'a1',
          category: 'fics',
          name: 'F-ics受信機　リニューアル',
          note: '（既存受信機撤去・新設　15個）',
          stopNote: '⚠ 該当受信機交換対応中は停止（約30分）',
          dayIndex: 0,
          labor: '3人工',
        },
        {
          id: 'a2',
          category: 'fics',
          name: 'F-ics制御ユニット　リニューアル',
          note: '（ロッカー制御Assy交換・試験）',
          stopNote: '⚠ F-ics停止（1〜2時間）',
          dayIndex: 4,
          labor: '2人工',
        },
        {
          id: 'a3',
          category: 'lock',
          name: 'ロッカーリニューアル',
          note: '（本体取替 13列/50BOX・2日間）',
          stopNote: '⚠ ロッカー停止（施工中）',
          dayIndex: 5,
          labor: '2人工×2日',
        },
        {
          id: 'a4',
          category: 'bike',
          name: '自転車入替',
          note: '（既存撤去・新規設置 15台）',
          dayIndex: 7,
          labor: '2人工',
        },
        {
          id: 'a5',
          category: 'forbid',
          name: '利用停止',
          note: '（荷物入庫停止）',
          forbidNote: '荷物入庫停止（事前案内要）',
          isDayRange: true,
          dayIndex: 2,
          dayFrom: 2,
          dayTo: 6,
          labor: null,
        },
      ],
    },
    {
      id: '42101',
      name: 'プラウド新浦安パークサイドフォート',
      color: 'green',
      items: [
        {
          id: 'b1',
          category: 'fics',
          name: 'F-ics受信機　リニューアル',
          note: '（既存受信機撤去・新設　15個）',
          stopNote: '⚠ 該当受信機交換対応中は停止（約30分）',
          dayIndex: 1,
          labor: '3人工',
        },
        {
          id: 'b2',
          category: 'fics',
          name: 'F-ics制御ユニット　リニューアル',
          note: '（ロッカー制御Assy交換）',
          stopNote: '⚠ F-ics停止（1〜2時間）',
          sharedNote: '★ 42111と同日・同作業者 → 人工費は42111に合算',
          dayIndex: 4,
          labor: null, // 合算
        },
        {
          id: 'b3',
          category: 'lock',
          name: 'ロッカーリニューアル',
          note: '（本体取替 8列/28BOX・2日間）',
          stopNote: '⚠ ロッカー停止',
          dayIndex: 5,
          labor: '1人工×2日',
        },
        {
          id: 'b4',
          category: 'forbid',
          name: '利用停止',
          note: '（荷物入庫停止）',
          forbidNote: '荷物入庫停止（事前案内要）',
          isDayRange: true,
          dayIndex: 2,
          dayFrom: 2,
          dayTo: 6,
          labor: null,
        },
      ],
    },
  ],

  // ── ガント行 ──────────────────────────────────────
  ganttRows: [
    { section: '42111　プラウド新浦安ベイサイドフォート　【作業】' },
    {
      label: 'F-ics受信機　リニューアル',
      sub: '3人工',
      cat: 'fics',
      bars: [{ col: 0, span: 1, cls: 'fics-a', text: '受信機 3人工' }],
    },
    {
      label: 'F-ics制御ユニット　リニューアル',
      sub: '2人工',
      cat: 'fics',
      bars: [{ col: 4, span: 1, cls: 'fics-a', text: 'F-ics制御 2人工' }],
    },
    {
      label: 'ロッカーリニューアル（13列/50BOX）',
      sub: '2人工 × 2日',
      cat: 'lock',
      bars: [{ col: 5, span: 2, cls: 'lock-a', text: 'ロッカーリニューアル 2人工' }],
    },
    {
      label: '自転車入替',
      sub: '2人工',
      cat: 'bike',
      bars: [{ col: 7, span: 1, cls: 'bike-a', text: '自転車入替 2人工' }],
    },
    { section: '42111　【停止・案内】', isStopSec: true },
    {
      label: '⚠ セキュリティ一時停止',
      cat: 'stop',
      bars: [
        { col: 0, span: 1, cls: 'stop-bar', text: '該当受信機交換中は停止（30分）' },
        { col: 4, span: 1, cls: 'stop-bar', text: 'セキュリティ全停止（1～2時間）' },
      ],
    },
    {
      label: '⚠ ロッカー停止',
      cat: 'stop',
      bars: [{ col: 4, span: 3, cls: 'stop-bar', text: '終日停止' }],
    },
    {
      label: '⚠ 荷物入庫停止',
      cat: 'forbid',
      bars: [{ col: 2, span: 5, cls: 'forbid-bar', text: '荷物入庫停止' }],
    },
    {
      label: '⚠ 自転車使用停止',
      cat: 'forbid',
      bars: [{ col: 4, span: 4, cls: 'forbid-bar', text: '自転車使用停止' }],
    },
    { section: '42101　プラウド新浦安パークサイドフォート　【作業】' },
    {
      label: 'F-ics受信機　リニューアル',
      sub: '3人工',
      cat: 'fics',
      bars: [{ col: 1, span: 1, cls: 'fics-b', text: '受信機 3人工' }],
    },
    {
      label: 'F-ics制御ユニット　リニューアル',
      sub: '★ 42111と同日・同作業者（人工合算）',
      cat: 'fics',
      bars: [{ col: 4, span: 1, cls: 'fics-b', text: 'F-ics制御（42111と合算）' }],
    },
    {
      label: 'ロッカーリニューアル（8列/28BOX）',
      sub: '1人工 × 2日',
      cat: 'lock',
      bars: [{ col: 5, span: 2, cls: 'lock-b', text: 'ロッカーリニューアル 1人工' }],
    },
    { section: '42101　【停止・案内】', isStopSec: true },
    {
      label: '⚠ セキュリティ一時停止',
      cat: 'stop',
      bars: [
        { col: 1, span: 1, cls: 'stop-bar', text: '該当受信機交換中は停止（30分）' },
        { col: 4, span: 1, cls: 'stop-bar', text: 'セキュリティ全停止（1～2時間）' },
      ],
    },
    {
      label: '⚠ ロッカー停止',
      cat: 'stop',
      bars: [{ col: 4, span: 3, cls: 'stop-bar', text: '終日停止' }],
    },
    {
      label: '⚠ 荷物入庫停止',
      cat: 'forbid',
      bars: [{ col: 2, span: 5, cls: 'forbid-bar', text: '荷物入庫停止' }],
    },
  ],

  // ── 凡例 ──────────────────────────────────────────
  legend: [
    { cls: 'fics-a', label: 'F-ics（42111）' },
    { cls: 'lock-a', label: 'ロッカー（42111）' },
    { cls: 'bike-a', label: '自転車入替（42111）' },
    { cls: 'fics-b', label: 'F-ics（42101）' },
    { cls: 'lock-b', label: 'ロッカー（42101）' },
    { cls: 'stop-bar', label: '停止期間' },
    { cls: 'forbid-bar', label: '荷物入庫停止 / 自転車使用停止', isPattern: true },
    { cls: 'reserve', label: '予備日' },
  ],

  // ── 備考 ──────────────────────────────────────────
  remarks: [
    '・セキュリティ一時停止：F-ics受信機取付時（約30分）、F-ics制御ユニット設定時（1〜2時間）に一時停止が発生します。',
    '・入庫停止：土曜日からロッカーリニューアル完了まで荷物入庫停止となります。居住者への事前掲示が必要です。',
    '・自転車：月曜日から自転車入替完了まで自転車の使用が停止となります。',
    '・最終作業日翌日（金曜日）を予備日とします。',
  ],
}

export default config
