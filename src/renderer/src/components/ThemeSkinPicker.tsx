import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { applySkin, applyTheme, loadSkin, loadTheme, type Skin, type Theme } from '../theme'

const THEMES: Array<[Theme, string]> = [
  ['system', '跟随系统'],
  ['light', '浅色'],
  ['dark', '深色']
]
const SKINS: Array<[Skin, string]> = [
  ['modern', '现代'],
  ['classic', '经典']
]

export default function ThemeSkinPicker(): JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => loadTheme())
  const [skin, setSkin] = useState<Skin>(() => loadSkin())

  useEffect(() => {
    applyTheme(loadTheme())
    applySkin(loadSkin())
  }, [])

  return (
    <div className="theme-skin-picker">
      <div className="theme-picker">
        {THEMES.map(([t, label]) => (
          <button key={t} type="button" className={`pick-btn ${t === theme ? 'active' : ''}`}
            onClick={() => { setTheme(t); applyTheme(t) }}>
            {label}
          </button>
        ))}
      </div>
      <div className="skin-picker">
        {SKINS.map(([s, label]) => (
          <button key={s} type="button" className={`pick-btn ${s === skin ? 'active' : ''}`}
            onClick={() => { setSkin(s); applySkin(s) }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
