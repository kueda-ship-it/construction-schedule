/**
 * Turso から物件一覧を取得・管理する React Hook
 */
import { useState, useEffect, useCallback } from 'react'
import type { ScheduleConfig } from '../types'
import {
  migrate, listProperties, upsertProperty, deleteProperty,
  countProperties, type PropertyEntry,
} from '../lib/db'
import { CONFIG_LIST } from '../config/index'

export type DbStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UsePropertiesResult {
  properties: PropertyEntry[]
  status: DbStatus
  error: string | null
  reload: () => Promise<void>
  save: (id: string, label: string, description: string, config: ScheduleConfig) => Promise<void>
  remove: (id: string) => Promise<void>
}

export function useProperties(): UsePropertiesResult {
  const [properties, setProperties] = useState<PropertyEntry[]>([])
  const [status, setStatus] = useState<DbStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setStatus('loading')
    try {
      await migrate()

      // 初回: DBが空なら静的configをシード投入
      const count = await countProperties()
      if (count === 0) {
        for (const entry of CONFIG_LIST) {
          await upsertProperty(entry.id, entry.label, entry.description, entry.config)
        }
      }

      const rows = await listProperties()
      setProperties(rows)
      setStatus('ready')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const save = useCallback(async (
    id: string, label: string, description: string, config: ScheduleConfig,
  ) => {
    await upsertProperty(id, label, description, config)
    await reload()
  }, [reload])

  const remove = useCallback(async (id: string) => {
    await deleteProperty(id)
    await reload()
  }, [reload])

  return { properties, status, error, reload, save, remove }
}
