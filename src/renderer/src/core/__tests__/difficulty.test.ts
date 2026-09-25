import { describe, expect, it } from 'vitest'
import { DIFFICULTIES } from '../difficulty'

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
