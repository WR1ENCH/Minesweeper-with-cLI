import type { BoardConfig, Difficulty } from './types'

export const DIFFICULTIES: Record<Difficulty, BoardConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 }
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '初级 9×9',
  intermediate: '中级 16×16',
  expert: '专家 30×16'
}
