import { useState } from 'react'
import type { JSX } from 'react'
import { DIFFICULTY_LABELS, DIFFICULTIES, resolveCustomConfig, SAFE_ZONE } from '../core/difficulty'
import type { BoardConfig, Difficulty, PresetDifficulty } from '../core/types'

interface DifficultyPickerProps {
  current: Difficulty
  /** 最近一次应用的自定义配置，作为输入框初值 */
  customConfig: BoardConfig
  onPick: (d: Difficulty) => void
  onStartCustom: (config: BoardConfig) => void
}

export default function DifficultyPicker({
  current,
  customConfig,
  onPick,
  onStartCustom
}: DifficultyPickerProps): JSX.Element {
  // 草稿在提交与失焦时被归一化写回（真实值可见），不加同步 effect
  const [draft, setDraft] = useState(() => ({
    rows: String(customConfig.rows),
    cols: String(customConfig.cols),
    mines: String(customConfig.mines)
  }))

  /** 归一化草稿并把真实值写回输入框（非法输入静默夹紧），返回合法配置 */
  const normalizeDraft = (): BoardConfig => {
    const cfg = resolveCustomConfig(draft)
    setDraft({ rows: String(cfg.rows), cols: String(cfg.cols), mines: String(cfg.mines) })
    return cfg
  }

  // 雷数上限随草稿盘面变化：行 × 列 − 首点安全区（9 格）
  const cap = resolveCustomConfig({ ...draft, mines: 1 })
  const maxMines = cap.rows * cap.cols - SAFE_ZONE

  return (
    <>
      <div className="difficulty-picker" role="group" aria-label="难度选择">
        {(Object.keys(DIFFICULTIES) as PresetDifficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            className={`diff-btn ${d === current ? 'active' : ''}`}
            onClick={() => onPick(d)}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
        <button
          type="button"
          className={`diff-btn ${current === 'custom' ? 'active' : ''}`}
          onClick={() => onPick('custom')}
        >
          自定义
        </button>
      </div>
      {current === 'custom' && (
        <form
          className="custom-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            onStartCustom(normalizeDraft())
          }}
        >
          <label>
            行{' '}
            <input
              type="number"
              min={5}
              max={50}
              value={draft.rows}
              onChange={(e) => setDraft((d) => ({ ...d, rows: e.target.value }))}
              onBlur={normalizeDraft}
            />
          </label>
          <label>
            列{' '}
            <input
              type="number"
              min={5}
              max={50}
              value={draft.cols}
              onChange={(e) => setDraft((d) => ({ ...d, cols: e.target.value }))}
              onBlur={normalizeDraft}
            />
          </label>
          <label>
            雷数{' '}
            <input
              type="number"
              min={1}
              max={maxMines}
              value={draft.mines}
              onChange={(e) => setDraft((d) => ({ ...d, mines: e.target.value }))}
              onBlur={normalizeDraft}
            />
          </label>
          <button type="submit" className="pick-btn">
            开始
          </button>
        </form>
      )}
    </>
  )
}
