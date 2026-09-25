import type { JSX } from 'react'
import type { GameState } from '../core/types'
import CellButton from './CellButton'

interface BoardProps {
  game: GameState
  onReveal: (r: number, c: number) => void
  onFlag: (r: number, c: number) => void
  onChord: (r: number, c: number) => void
}

export default function Board({ game, onReveal, onFlag, onChord }: BoardProps): JSX.Element {
  const { cells, config } = game
  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${config.cols}, var(--cell-size))` }}
    >
      {cells.flatMap((row, r) =>
        row.map((cell, c) => (
          <CellButton
            key={`${r}-${c}`}
            cell={cell}
            r={r}
            c={c}
            status={game.status}
            onReveal={() => onReveal(r, c)}
            onFlag={() => onFlag(r, c)}
            onChord={() => onChord(r, c)}
          />
        ))
      )}
    </div>
  )
}
