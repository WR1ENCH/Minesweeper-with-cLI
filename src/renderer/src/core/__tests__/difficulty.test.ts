import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, resolveCustomConfig } from '../difficulty'

describe('DIFFICULTIES', () => {
  it('beginner is 9x9 with 10 mines', () => {
    expect(DIFFICULTIES.beginner).toEqual({ rows: 9, cols: 9, mines: 10 })
  })
  it('intermediate is 16x16 with 40 mines', () => {
    expect(DIFFICULTIES.intermediate).toEqual({ rows: 16, cols: 16, mines: 40 })
  })
  it('expert is 16 rows x 30 cols with 99 mines', () => {
    expect(DIFFICULTIES.expert).toEqual({ rows: 16, cols: 30, mines: 99 })
  })
})

describe('resolveCustomConfig', () => {
  it('passes valid values through unchanged', () => {
    expect(resolveCustomConfig({ rows: 16, cols: 30, mines: 99 })).toEqual({
      rows: 16,
      cols: 30,
      mines: 99
    })
  })

  it('clamps sizes to [5,50] and rounds decimals', () => {
    // 行夹到 50、列取整为 13，50*13−9 = 641 ≥ 100 故雷数原样通过
    expect(resolveCustomConfig({ rows: 999, cols: '12.7', mines: 100 })).toEqual({
      rows: 50,
      cols: 13,
      mines: 100
    })
    expect(resolveCustomConfig({ rows: 0, cols: 9, mines: 10 }).rows).toBe(5)
  })

  it('caps mines at rows*cols − 9 (safe zone reserved)', () => {
    expect(resolveCustomConfig({ rows: 50, cols: 50, mines: 99999 }).mines).toBe(2491)
    expect(resolveCustomConfig({ rows: 5, cols: 5, mines: 100 }).mines).toBe(16)
  })

  it('falls back to defaults on non-numeric input and clamps mines to >= 1', () => {
    expect(resolveCustomConfig({ rows: 'abc', cols: '', mines: 'x' })).toEqual({
      rows: 9,
      cols: 9,
      mines: 10
    })
    expect(resolveCustomConfig({ rows: 9, cols: 9, mines: -5 }).mines).toBe(1)
    expect(resolveCustomConfig({ rows: 9, cols: 9, mines: 0 }).mines).toBe(1)
  })
})
