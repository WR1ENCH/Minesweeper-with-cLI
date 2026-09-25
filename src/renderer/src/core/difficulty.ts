import type { BoardConfig, PresetDifficulty } from './types'

export const DIFFICULTIES: Record<PresetDifficulty, BoardConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 }
}

export const DIFFICULTY_LABELS: Record<PresetDifficulty, string> = {
  beginner: '初级 9×9',
  intermediate: '中级 16×16',
  expert: '专家 30×16'
}

/** 首点保护：safeR/safeC 的 3×3 邻域（含自身）最多 9 格 */
export const SAFE_ZONE = 9
export const CUSTOM_LIMITS = {
  minSize: 5,
  maxSize: 50,
  defaultRows: 9,
  defaultCols: 9,
  defaultMines: 10
} as const

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))

/** 解析 + 归一化：每字段先 parse（空串/NaN → fallback，其余 Math.round），再 clamp。 */
export function resolveCustomConfig(raw: {
  rows: string | number
  cols: string | number
  mines: string | number
}): BoardConfig {
  const int = (v: string | number, fb: number): number => {
    const n = typeof v === 'string' ? (v.trim() === '' ? NaN : Number(v)) : v
    return Number.isFinite(n) ? Math.round(n) : fb
  }
  const rows = clamp(int(raw.rows, CUSTOM_LIMITS.defaultRows), CUSTOM_LIMITS.minSize, CUSTOM_LIMITS.maxSize)
  const cols = clamp(int(raw.cols, CUSTOM_LIMITS.defaultCols), CUSTOM_LIMITS.minSize, CUSTOM_LIMITS.maxSize)
  // 顺序是算法关键：先定行/列（rows*cols ≥ 25），再按该盘面算 maxMines = rows*cols − 9 ≥ 16 夹雷数
  const mines = clamp(int(raw.mines, CUSTOM_LIMITS.defaultMines), 1, rows * cols - SAFE_ZONE)
  return { rows, cols, mines }
}
