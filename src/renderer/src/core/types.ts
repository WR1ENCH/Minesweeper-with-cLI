export type Difficulty = 'beginner' | 'intermediate' | 'expert'

export interface BoardConfig {
  rows: number
  cols: number
  mines: number
}

/** 与 UI 数字颜色档位对应：0 显示空白 */
export type AdjacentCount = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface Cell {
  mine: boolean
  /** 仅统计 8 邻域内的雷数，与 mine 无关（雷格也可以有邻雷数） */
  adjacent: AdjacentCount
  state: CellState
}

export type CellState = 'hidden' | 'revealed' | 'flagged'

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export interface GameState {
  difficulty: Difficulty
  config: BoardConfig
  cells: Cell[][]
  status: GameStatus
  /** 首次翻格后设置，之后不再变化 */
  startTime: number | null
  endTime: number | null
  /** 当前实际插旗数（含误插） */
  flags: number
}
