// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { loadRecords, saveRecord } from '../records'

describe('records', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns all null when empty', () => {
    expect(loadRecords()).toEqual({
      beginner: null,
      intermediate: null,
      expert: null
    })
  })

  it('saves and loads a record', () => {
    saveRecord('beginner', 42)
    expect(loadRecords().beginner).toBe(42)
  })

  it('keeps the fastest time per difficulty', () => {
    saveRecord('beginner', 30)
    saveRecord('beginner', 50)
    expect(loadRecords().beginner).toBe(30)
  })

  it('survives corrupt JSON', () => {
    localStorage.setItem('minesweeper-records', 'not-json{')
    expect(loadRecords().beginner).toBeNull()
  })
})
