import { describe, expect, it } from 'vitest'
import { DIFFICULTIES } from '../difficulty'
import { createGame, placeMines } from '../board'

describe('createGame', () => {
  it('creates hidden board with correct dimensions', () => {
    const s = createGame(DIFFICULTIES.beginner, 'beginner')
    expect(s.cells).toHaveLength(9)
    expect(s.cells[0]).toHaveLength(9)
    expect(s.status).toBe('ready')
    expect(s.flags).toBe(0)
    expect(s.startTime).toBeNull()
    s.cells.flat().forEach((c) => {
      expect(c.state).toBe('hidden')
      expect(c.mine).toBe(false)
      expect(c.adjacent).toBe(0)
    })
  })
})

describe('placeMines', () => {
  it('places exactly config.mines mines, none in the 3x3 safe zone', () => {
    const s = createGame(DIFFICULTIES.beginner, 'beginner')
    placeMines(s, 4, 4)
    let mineCount = 0
    for (let r = 3; r <= 5; r++)
      for (let c = 3; c <= 5; c++) {
        expect(s.cells[r][c].mine).toBe(false)
      }
    s.cells.flat().forEach((c) => {
      if (c.mine) mineCount++
    })
    expect(mineCount).toBe(10)
  })

  it('fills adjacent counts correctly', () => {
    const s = createGame(DIFFICULTIES.beginner, 'beginner')
    placeMines(s, 4, 4)
    // 任意非雷格的 adjacent 等于其 8 邻域雷数
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
        expect(s.cells[r][c].adjacent).toBe(n)
      }
  })
})
