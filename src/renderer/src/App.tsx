import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import { createGame } from './core/board'
import { chord, getElapsedSeconds, revealCell, toggleFlag } from './core/game'
import { DIFFICULTIES } from './core/difficulty'
import { loadRecords, saveCustomRecord, saveRecord, type Records } from './core/records'
import type { BoardConfig, Difficulty, GameState } from './core/types'
import Board from './components/Board'
import HeaderBar from './components/HeaderBar'
import DifficultyPicker from './components/DifficultyPicker'
import ThemeSkinPicker from './components/ThemeSkinPicker'
import { applySkin, applyTheme } from './theme'

export default function App(): JSX.Element {
  const [records, setRecords] = useState<Records>(() => loadRecords())
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [customConfig, setCustomConfig] = useState<BoardConfig>({ rows: 9, cols: 9, mines: 10 })
  const [game, setGame] = useState<GameState>(() => createGame(DIFFICULTIES.beginner, 'beginner'))

  const restart = useCallback(
    (d: Difficulty = difficulty): void => {
      setDifficulty(d)
      setGame(createGame(d === 'custom' ? customConfig : DIFFICULTIES[d], d))
    },
    [difficulty, customConfig]
  )

  const startCustom = useCallback((config: BoardConfig): void => {
    setCustomConfig(config)
    setDifficulty('custom')
    setGame(createGame(config, 'custom'))
  }, [])

  // 菜单消息（main 进程的通道）
  useEffect(() => {
    const disposers: Array<() => void> = []
    const on = (channel: string, cb: () => void): void => {
      window.electron.ipcRenderer.on(channel, cb)
      disposers.push(() => window.electron.ipcRenderer.removeListener(channel, cb))
    }
    on('menu:new-game', () => restart(difficulty))
    on('menu:difficulty-beginner', () => restart('beginner'))
    on('menu:difficulty-intermediate', () => restart('intermediate'))
    on('menu:difficulty-expert', () => restart('expert'))
    on('menu:theme-light', () => applyTheme('light'))
    on('menu:theme-dark', () => applyTheme('dark'))
    on('menu:theme-system', () => applyTheme('system'))
    on('menu:skin-classic', () => applySkin('classic'))
    on('menu:skin-modern', () => applySkin('modern'))
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
    if (game.status !== 'won') return
    const seconds = getElapsedSeconds(game)
    setRecords(
      game.difficulty === 'custom'
        ? saveCustomRecord(game.config, seconds)
        : saveRecord(game.difficulty, seconds)
    )
  }, [game.status])

  useEffect(() => {
    if (game.status === 'lost') window.electron.ipcRenderer.send('game:over')
    if (game.status === 'won') window.electron.ipcRenderer.send('game:win')
  }, [game.status])

  return (
    <div className="app">
      <HeaderBar game={game} records={records} onRestart={() => restart(difficulty)} />
      <DifficultyPicker
        current={difficulty}
        customConfig={customConfig}
        onPick={restart}
        onStartCustom={startCustom}
      />
      <ThemeSkinPicker />
      <div className="board-scroll">
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
    </div>
  )
}
