import { resolveCustomConfig } from './difficulty'
import type { BoardConfig, Cell, Difficulty, GameState } from './types'

export function createGame(config: BoardConfig, difficulty: Difficulty): GameState {
  // 唯一咽喉点：任何来源（UI/菜单/测试）的配置进入 GameState 前先归一化，
  // 保证 mines ≤ rows*cols − SAFE_ZONE 这一可布雷不变量结构性成立。
  const cfg = resolveCustomConfig(config)
  const cells: Cell[][] = Array.from({ length: cfg.rows }, () =>
    Array.from({ length: cfg.cols }, () => ({
      mine: false,
      adjacent: 0 as Cell['adjacent'],
      state: 'hidden' as const
    }))
  )
  return {
    difficulty,
    config: cfg,
    cells,
    status: 'ready',
    startTime: null,
    endTime: null,
    flags: 0
  }
}

/**
 * 首次翻格时布雷：safeR/safeC 及其 8 邻域保证无雷（首点保护）。
 *
 * 可布雷性不变量（由 createGame 的 resolveCustomConfig 结构性保证）：
 *   mines ≤ rows·cols − 9；首点安全区 safeCount ≤ 9（角落 4 / 边 6 / 内部 9）
 *   ⇒ 可布雷位 rows·cols − safeCount ≥ rows·cols − 9 ≥ mines
 *   ⇒ indices.length ≥ mines，部分洗牌 indices[i] 永不越界。
 */
export function placeMines(state: GameState, safeR: number, safeC: number): void {
  const { rows, cols, mines } = state.config
  const safe = new Set<number>()
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const r = safeR + dr
      const c = safeC + dc
      if (r >= 0 && r < rows && c >= 0 && c < cols) safe.add(r * cols + c)
    }

  const total = rows * cols
  const indices = Array.from({ length: total }, (_, i) => i).filter((i) => !safe.has(i))
  // Fisher–Yates 部分洗牌：只需前 mines 个位置
  for (let i = 0; i < mines; i++) {
    const j = i + Math.floor(Math.random() * (indices.length - i))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  for (let i = 0; i < mines; i++) {
    const idx = indices[i]
    const r = Math.floor(idx / cols)
    const c = idx % cols
    state.cells[r][c].mine = true
  }

  // 计算邻雷数
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (state.cells[r][c].mine) continue
      let n = 0
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr
          const cc = c + dc
          if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && state.cells[rr][cc].mine) n++
        }
      state.cells[r][c].adjacent = n as Cell['adjacent']
    }
}
