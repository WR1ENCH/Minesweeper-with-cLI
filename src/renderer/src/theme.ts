export type Theme = 'system' | 'light' | 'dark'
export type Skin = 'modern' | 'classic'

const THEME_KEY = 'minesweeper-theme'
const SKIN_KEY = 'minesweeper-skin'

export function loadTheme(): Theme {
  const v = localStorage.getItem(THEME_KEY)
  return v === 'light' || v === 'dark' ? v : 'system'
}

export function loadSkin(): Skin {
  return localStorage.getItem(SKIN_KEY) === 'classic' ? 'classic' : 'modern'
}

const mql = window.matchMedia('(prefers-color-scheme: dark)')

export function applyTheme(theme: Theme): void {
  const dark = theme === 'dark' || (theme === 'system' && mql.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  localStorage.setItem(THEME_KEY, theme)
  window.electron.ipcRenderer.send('settings:save', { theme })
}

export function applySkin(skin: Skin): void {
  document.documentElement.dataset.skin = skin
  localStorage.setItem(SKIN_KEY, skin)
}

mql.addEventListener('change', () => {
  if (loadTheme() === 'system') applyTheme('system')
})
