import { memo } from 'react'
import type { JSX } from 'react'
import type { Cell, GameStatus } from '../core/types'

interface CellButtonProps {
  cell: Cell
  r: number
  c: number
  status: GameStatus
  onReveal: () => void
  onFlag: () => void
  onChord: () => void
}

const NUM_CLASS = ['', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8']

function CellButton({ cell, r, c, status, onReveal, onFlag, onChord }: CellButtonProps): JSX.Element {
  const revealed = cell.state === 'revealed'
  const showMine = cell.mine && (status === 'lost' || (status === 'won' && cell.state === 'flagged'))
  const label = revealed ? (cell.mine ? '💣' : cell.adjacent || '') : cell.state === 'flagged' ? '🚩' : ''

  return (
    <button
      type="button"
      className={`cell ${revealed ? 'revealed' : 'hidden-cell'} ${revealed && !cell.mine ? NUM_CLASS[cell.adjacent] : ''} ${showMine ? 'exploded' : ''}`}
      disabled={status === 'lost' || status === 'won'}
      onClick={onReveal}
      onContextMenu={(e) => {
        e.preventDefault()
        onFlag()
      }}
      onDoubleClick={onChord}
      aria-label={`第 ${r + 1} 行 第 ${c + 1} 列`}
    >
      {label}
    </button>
  )
}

export default memo(CellButton)
