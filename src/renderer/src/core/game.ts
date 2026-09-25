import type { GameState } from './types'
import { placeMines } from './board'

function neighbors(r: number, c: number, rows: number, cols: number): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const rr = r + dr
      const cc = c + dc
      if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) out.push([rr, cc])
    }
  return out
}

/** 翻开单格：若为 0 则 BFS 展开整个空白区域。踩雷立即置 lost 并返回。 */
function openCell(state: GameState, r: number, c: number): void {
  const { rows, cols } = state.config
  const queue: Array<[number, number]> = [[r, c]]
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!
    const cell = state.cells[cr][cc]
    if (cell.state !== 'hidden') continue
    cell.state = 'revealed'
    if (cell.mine) {
      state.status = 'lost'
      state.endTime = Date.now()
      return
    }
    if (cell.adjacent === 0) {
      for (const [nr, nc] of neighbors(cr, cc, rows, cols)) {
        if (state.cells[nr][nc].state === 'hidden') queue.push([nr, nc])
      }
    }
  }
}

function checkWin(state: GameState): void {
  if (state.status !== 'playing') return
  const { cells } = state
  for (const row of cells)
    for (const cell of row) {
      if (!cell.mine && cell.state === 'hidden') return
    }
  state.status = 'won'
  state.endTime = Date.now()
  // 胜利时自动给所有雷插旗（经典行为）
  for (const row of cells)
    for (const cell of row) {
      if (cell.mine && cell.state !== 'flagged') {
        cell.state = 'flagged'
        state.flags++
      }
    }
}

export function revealCell(state: GameState, r: number, c: number): void {
  if (state.status === 'won' || state.status === 'lost') return
  const cell = state.cells[r][c]
  if (cell.state !== 'hidden') return

  if (state.status === 'ready') {
    placeMines(state, r, c)
    state.startTime = Date.now()
    state.status = 'playing'
  }

  openCell(state, r, c)
  if (state.status === 'playing') checkWin(state)
}

export function toggleFlag(state: GameState, r: number, c: number): void {
  if (state.status === 'won' || state.status === 'lost') return
  const cell = state.cells[r][c]
  if (cell.state === 'revealed') return
  if (cell.state === 'hidden') {
    cell.state = 'flagged'
    state.flags++
  } else {
    cell.state = 'hidden'
    state.flags--
  }
}

export function chord(state: GameState, r: number, c: number): void {
  if (state.status === 'won' || state.status === 'lost') return
  const cell = state.cells[r][c]
  if (cell.state !== 'revealed' || cell.adjacent === 0) return

  const { rows, cols } = state.config
  const ns = neighbors(r, c, rows, cols)
  const flagCount = ns.filter(([nr, nc]) => state.cells[nr][nc].state === 'flagged').length
  if (flagCount !== cell.adjacent) return

  // 逐个翻：openCell 内部踩雷会立即置 lost，此时中止后续翻格
  for (const [nr, nc] of ns) {
    const target = state.cells[nr][nc]
    if (target.state !== 'hidden') continue
    openCell(state, nr, nc)
    if (state.cells[nr][nc].mine) return
  }
  checkWin(state)
}

export function getElapsedSeconds(state: GameState): number {
  if (state.status === 'ready' || state.startTime === null) return 0
  const end = state.endTime ?? Date.now()
  return Math.max(0, Math.floor((end - state.startTime) / 1000))
}
