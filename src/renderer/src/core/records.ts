import type { Difficulty } from './types'

export type Records = Record<Difficulty, number | null>

const KEY = 'minesweeper-records'

export function loadRecords(): Records {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { beginner: null, intermediate: null, expert: null }
    const parsed = JSON.parse(raw) as Partial<Records>
    return {
      beginner: typeof parsed.beginner === 'number' ? parsed.beginner : null,
      intermediate: typeof parsed.intermediate === 'number' ? parsed.intermediate : null,
      expert: typeof parsed.expert === 'number' ? parsed.expert : null
    }
  } catch {
    return { beginner: null, intermediate: null, expert: null }
  }
}

export function saveRecord(d: Difficulty, seconds: number): Records {
  const cur = loadRecords()
  const prev = cur[d]
  if (prev !== null && seconds >= prev) return cur
  cur[d] = seconds
  localStorage.setItem(KEY, JSON.stringify(cur))
  return cur
}
