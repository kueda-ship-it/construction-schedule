/**
 * 物件コンフィグ レジストリ
 * 新しい物件を追加する場合はここにエントリを追加する
 */
import type { ScheduleConfig } from '../types'
import proudShinUrayasu from './proud-shin-urayasu'

export interface ConfigEntry {
  id: string
  /** モーダル一覧に表示する物件名 */
  label: string
  /** サブ説明（管理番号等） */
  description: string
  config: ScheduleConfig
}

export const CONFIG_LIST: ConfigEntry[] = [
  {
    id: 'proud-shin-urayasu',
    label: 'プラウド新浦安ベイサイドフォート / パークサイドフォート',
    description: '42111 / 42101　F-icsリニューアル・ロッカーリニューアル・自転車入替',
    config: proudShinUrayasu,
  },
]

export function findConfig(id: string): ConfigEntry | undefined {
  return CONFIG_LIST.find(c => c.id === id)
}
