import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import { createGame } from './core/board'
import { chord, getElapsedSeconds, revealCell, toggleFlag } from './core/game'
import { DIFFICULTIES } from './core/difficulty'
import type { Difficulty, GameState } from './core/types'
import Board from './components/Board'
import HeaderBar from './components/HeaderBar'
import DifficultyPicker from './components/DifficultyPicker'

function newGame(difficulty: Difficulty): GameState {
  return createGame(DIFFICULTIES[difficulty], difficulty)
}

export default function App(): JSX.Element {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [game, setGame] = useState<GameState>(() => newGame('beginner'))

  const restart = useCallback((d: Difficulty = difficulty): void => {
    setDifficulty(d)
    setGame(newGame(d))
  }, [difficulty])

  // 菜单消息（main 进程的通道）
  useEffect(() => {
    const onNewGame = (): void => restart(difficulty)
    const disposers: Array<() => void> = []
    const on = (channel: string, cb: () => void): void => {
      window.electron.ipcRenderer.on(channel, cb)
      disposers.push(() => window.electron.ipcRenderer.removeListener(channel, cb))
    }
    on('menu:new-game', onNewGame)
    on('menu:difficulty-beginner', () => restart('beginner'))
    on('menu:difficulty-intermediate', () => restart('intermediate'))
    on('menu:difficulty-expert', () => restart('expert'))
    return () => disposers.forEach((d) => d())
  }, [restart, difficulty])

  // 计时上报主进程（标题栏）
  useEffect(() => {
    if (game.status !== 'playing') return
    const id = setInterval(() => {
      window.electron.ipcRenderer.send('game:time', getElapsedSeconds(game))
    }, 1000)
    return () => clearInterval(id)
  }, [game])

  useEffect(() => {
    if (game.status === 'lost') window.electron.ipcRenderer.send('game:over')
    if (game.status === 'won') window.electron.ipcRenderer.send('game:win')
  }, [game.status])

  return (
    <div className="app">
      <HeaderBar game={game} onRestart={() => restart(difficulty)} />
      <DifficultyPicker current={difficulty} onPick={restart} />
      <Board
        game={game}
        onReveal={(r, c) => {
          const next = structuredClone(game)
          revealCell(next, r, c)
          setGame(next)
        }}
        onFlag={(r, c) => {
          const next = structuredClone(game)
          toggleFlag(next, r, c)
          setGame(next)
        }}
        onChord={(r, c) => {
          const next = structuredClone(game)
          chord(next, r, c)
          setGame(next)
        }}
      />
    </div>
  )
}
