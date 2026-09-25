// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { loadRecords, saveCustomRecord, saveRecord } from '../records'

describe('records', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns all null when empty', () => {
    expect(loadRecords()).toEqual({
      beginner: null,
      intermediate: null,
      expert: null,
      custom: {}
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

  it('saves per-config custom records without overwriting', () => {
    const cfg = { rows: 5, cols: 5, mines: 1 }
    saveCustomRecord(cfg, 20)
    expect(loadRecords().custom['5x5x1']).toBe(20)
    saveCustomRecord(cfg, 30)
    expect(loadRecords().custom['5x5x1']).toBe(20)
    saveCustomRecord({ rows: 5, cols: 5, mines: 2 }, 25)
    const rec = loadRecords()
    expect(rec.custom['5x5x1']).toBe(20)
    expect(rec.custom['5x5x2']).toBe(25)
  })

  it('loads legacy records without a custom field as an empty map', () => {
    localStorage.setItem('minesweeper-records', JSON.stringify({ beginner: 11 }))
    const rec = loadRecords()
    expect(rec.custom).toEqual({})
    expect(rec.beginner).toBe(11)
  })
})
