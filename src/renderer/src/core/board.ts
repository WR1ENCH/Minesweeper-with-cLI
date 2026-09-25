import type { BoardConfig, Cell, Difficulty, GameState } from './types'

export function createGame(config: BoardConfig, difficulty: Difficulty): GameState {
  const cells: Cell[][] = Array.from({ length: config.rows }, () =>
    Array.from({ length: config.cols }, () => ({
      mine: false,
      adjacent: 0 as Cell['adjacent'],
      state: 'hidden' as const
    }))
  )
  return {
    difficulty,
    config,
    cells,
    status: 'ready',
    startTime: null,
    endTime: null,
    flags: 0
  }
}

/** 首次翻格时布雷：safeR/safeC 及其 8 邻域保证无雷（首点保护）。 */
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
