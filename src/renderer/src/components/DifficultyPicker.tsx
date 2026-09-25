import type { JSX } from 'react'
import { DIFFICULTY_LABELS, DIFFICULTIES } from '../core/difficulty'
import type { Difficulty } from '../core/types'

interface DifficultyPickerProps {
  current: Difficulty
  onPick: (d: Difficulty) => void
}

export default function DifficultyPicker({ current, onPick }: DifficultyPickerProps): JSX.Element {
  return (
    <div className="difficulty-picker" role="group" aria-label="难度选择">
      {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
        <button
          key={d}
          type="button"
          className={`diff-btn ${d === current ? 'active' : ''}`}
          onClick={() => onPick(d)}
        >
          {DIFFICULTY_LABELS[d]}
        </button>
      ))}
    </div>
  )
}
