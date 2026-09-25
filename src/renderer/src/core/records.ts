import type { BoardConfig, PresetDifficulty } from './types'

export interface Records {
  beginner: number | null
  intermediate: number | null
  expert: number | null
  /** key = customRecordKey(config)，只存该配置最快成绩 */
  custom: Record<string, number>
}

const KEY = 'minesweeper-records'

export function customRecordKey(config: BoardConfig): string {
  return `${config.rows}x${config.cols}x${config.mines}` // 如 "16x16x40"
}

/** custom 字段清洗：必须是普通对象，值必须 Number.isFinite，否则丢弃 */
function sanitizeCustom(v: unknown): Record<string, number> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return {}
  const out: Record<string, number> = {}
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === 'number' && Number.isFinite(val)) out[k] = val
  }
  return out
}

export function loadRecords(): Records {
  const fallback: Records = { beginner: null, intermediate: null, expert: null, custom: {} }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<Records>
    return {
      beginner: typeof parsed.beginner === 'number' ? parsed.beginner : null,
      intermediate: typeof parsed.intermediate === 'number' ? parsed.intermediate : null,
      expert: typeof parsed.expert === 'number' ? parsed.expert : null,
      custom: sanitizeCustom(parsed.custom)
    }
  } catch {
    return fallback
  }
}

export function saveRecord(d: PresetDifficulty, seconds: number): Records {
  const cur = loadRecords()
  const prev = cur[d]
  if (prev !== null && seconds >= prev) return cur
  cur[d] = seconds
  localStorage.setItem(KEY, JSON.stringify(cur))
  return cur
}

export function saveCustomRecord(config: BoardConfig, seconds: number): Records {
  const cur = loadRecords()
  const key = customRecordKey(config)
  const prev = cur.custom[key]
  if (prev !== undefined && seconds >= prev) return cur
  cur.custom[key] = seconds
  localStorage.setItem(KEY, JSON.stringify(cur))
  return cur
}
