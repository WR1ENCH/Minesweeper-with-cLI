import { beforeEach, describe, expect, it } from 'vitest'
import { DIFFICULTIES } from '../difficulty'
import { createGame } from '../board'
import { chord, getElapsedSeconds, revealCell, toggleFlag } from '../game'
import type { GameState } from '../types'

/** 测试专用：手动布雷绕过 placeMines 的随机性（直接改 cells，再算 adjacent） */
function seedGame(mines: Array<[number, number]>): GameState {
  const s = createGame(DIFFICULTIES.beginner, 'beginner')
  for (const [r, c] of mines) s.cells[r][c].mine = true
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      if (s.cells[r][c].mine) continue
      let n = 0
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr
          const cc = c + dc
          if (rr >= 0 && rr < 9 && cc >= 0 && cc < 9 && s.cells[rr][cc].mine) n++
        }
      s.cells[r][c].adjacent = n as 1
    }
  s.status = 'playing' // 视为已开局：revealCell 不再触发 placeMines 布雷
  return s
}

describe('revealCell', () => {
  it('first reveal places mines (no mine in 3x3 around first click) and starts timer', () => {
    const s = createGame(DIFFICULTIES.beginner, 'beginner')
    revealCell(s, 0, 0)
    expect(s.status).toBe('playing')
    expect(s.startTime).not.toBeNull()
    for (let r = 0; r <= 1; r++)
      for (let c = 0; c <= 1; c++) expect(s.cells[r][c].mine).toBe(false)
    const count = s.cells.flat().filter((c) => c.mine).length
    expect(count).toBe(10)
  })

  it('flood-fills zeros via BFS and stops at boundary numbers', () => {
    const s = seedGame([
      [0, 0],
      [1, 1]
    ])
    revealCell(s, 4, 4)
    expect(s.cells[4][4].state).toBe('revealed')
    // 雷本身未被翻
    expect(s.cells[0][0].state).toBe('hidden')
    expect(s.cells[1][1].state).toBe('hidden')
    // (0,1) 是两雷包围的数字格（adjacent 2），四周无空白格连通，BFS 到数字格为止
    expect(s.cells[0][1].state).toBe('hidden')
    // 远处空白区被展开
    expect(s.cells[4][6].state).toBe('revealed')
  })

  it('revealing a mine loses the game', () => {
    const s = seedGame([[4, 4]])
    revealCell(s, 4, 4)
    expect(s.status).toBe('lost')
    expect(s.endTime).not.toBeNull()
  })

  it('revealing all non-mine cells wins', () => {
    const s = seedGame([[0, 0]])
    // 翻开所有非雷格
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) {
        if (!s.cells[r][c].mine && s.cells[r][c].state === 'hidden') revealCell(s, r, c)
      }
    expect(s.status).toBe('won')
    expect(s.endTime).not.toBeNull()
  })

  it('ignores reveal on flagged or already-revealed cells', () => {
    const s = seedGame([[0, 0]])
    toggleFlag(s, 1, 1)
    revealCell(s, 1, 1)
    expect(s.cells[1][1].state).toBe('flagged')
    revealCell(s, 2, 2)
    const before = JSON.stringify(s.cells)
    revealCell(s, 2, 2)
    expect(JSON.stringify(s.cells)).toBe(before)
  })

  it('locks input after game over', () => {
    const s = seedGame([[4, 4]])
    revealCell(s, 4, 4)
    toggleFlag(s, 0, 8)
    expect(s.cells[0][8].state).toBe('hidden')
  })
})

describe('toggleFlag', () => {
  let s: GameState
  beforeEach(() => {
    s = seedGame([
      [4, 4],
      [0, 0]
    ])
  })
  it('flags and unflags, tracking count', () => {
    toggleFlag(s, 0, 0)
    expect(s.cells[0][0].state).toBe('flagged')
    expect(s.flags).toBe(1)
    toggleFlag(s, 0, 0)
    expect(s.flags).toBe(0)
  })
  it('opens neighbors when flag count matches number', () => {
    // 雷在 (0,0) 与 (4,8)；先翻数字格 (0,1) 启动，再旗住雷，chord 中心 (0,1)
    const s = seedGame([
      [0, 0],
      [4, 8]
    ])
    revealCell(s, 0, 1) // 数字格（adjacent 1），不触发大范围 flood
    toggleFlag(s, 0, 0) // 旗在真正的雷上
    const center = s.cells[0][1]
    expect(center.adjacent).toBe(1)
    chord(s, 0, 1)
    // (1,0) 与 (1,1) 是隐藏的未旗格，应被翻开
    expect(s.cells[1][0].state).toBe('revealed')
    expect(s.cells[1][1].state).toBe('revealed')
  })

  it('does nothing when flags do not match', () => {
    const s = seedGame([
      [4, 4],
      [0, 0]
    ])
    revealCell(s, 8, 8) // 安全翻格（两颗雷保底不会自动获胜）
    const before = JSON.stringify(s.cells)
    chord(s, 3, 3) // 没有旗，旗数 !== adjacent，应无任何变化
    expect(JSON.stringify(s.cells)).toBe(before)
  })

  it('can lose via chord when flags are wrong', () => {
    const s = seedGame([
      [0, 0],
      [4, 8]
    ])
    revealCell(s, 0, 1) // 翻数字格启动，不触发 flood win
    // 在非雷格 (1,0) 插旗凑够 1 面旗，但雷 (0,0) 未旗
    toggleFlag(s, 1, 0)
    chord(s, 0, 1) // 旗数 1 === adjacent 1，翻开未旗隐藏格 (0,0) → 踩雷
    expect(s.status).toBe('lost')
  })
})

describe('getElapsedSeconds', () => {
  it('returns 0 before start, wall-clock while playing, frozen after end', () => {
    const s = seedGame([[4, 4]])
    expect(getElapsedSeconds(s)).toBe(0)
    revealCell(s, 8, 8)
    expect(getElapsedSeconds(s)).toBeGreaterThanOrEqual(0)
    revealCell(s, 4, 4) // lost
    const t1 = getElapsedSeconds(s)
    const t2 = getElapsedSeconds(s)
    expect(t1).toBe(t2)
  })
})
