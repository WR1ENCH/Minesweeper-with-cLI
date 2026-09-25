import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { getElapsedSeconds } from '../core/game'
import type { GameState } from '../core/types'

const MINE_EMOJI = '💣'

import { customRecordKey, type Records } from '../core/records'

interface HeaderBarProps {
  game: GameState
  records?: Records
  onRestart: () => void
}

export default function HeaderBar({ game, records, onRestart }: HeaderBarProps): JSX.Element {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (game.status !== 'playing') return
    const id = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(id)
  }, [game.status])

  const remaining = game.config.mines - game.flags
  const statusIcon = game.status === 'lost' ? '😵' : game.status === 'won' ? '😎' : '🙂'

  return (
    <header className="header">
      <div className="counter">{MINE_EMOJI} {String(Math.max(0, remaining)).padStart(3, '0')}</div>
      <button type="button" className="face" onClick={onRestart} title="新游戏 (F2)">
        {statusIcon}
      </button>
      <div className="counter">
        {String(Math.min(999, getElapsedSeconds(game))).padStart(3, '0')}
      </div>
      <div className="best">
        最佳:{' '}
        {records == null
          ? '--'
          : game.difficulty === 'custom'
            ? (records.custom[customRecordKey(game.config)] ?? '--')
            : (records[game.difficulty] ?? '--')}
      </div>
    </header>
  )
}
