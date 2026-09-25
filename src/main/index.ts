import { app, shell, BrowserWindow, Menu, ipcMain } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { is } from '@electron-toolkit/utils'
import { buildMenu } from './menu'
import './security'

let win: BrowserWindow | null = null

function createWindow(): void {
  win = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 320,
    minHeight: 400,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => win?.show())

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

interface AppSettings {
  theme: 'system' | 'light' | 'dark'
}
const DEFAULT_SETTINGS: AppSettings = { theme: 'system' }

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function loadSettings(): AppSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(readFileSync(settingsPath(), 'utf-8')) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(buildMenu(() => win)))
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.handle('settings:load', () => loadSettings())
  ipcMain.on('settings:save', (_e, settings: AppSettings) => {
    try {
      mkdirSync(dirname(settingsPath()), { recursive: true })
      writeFileSync(settingsPath(), JSON.stringify(settings, null, 2))
    } catch {
      /* 持久化失败不影响游戏 */
    }
  })

  ipcMain.on('game:time', (_e, seconds: number) => {
    win?.setTitle(`扫雷 — ${seconds}s`)
  })
  const flash = (ch: string): void => {
    if (!win) return
    win.setTitle(ch)
    setTimeout(() => win?.setTitle('扫雷'), 1000)
    setTimeout(() => win?.setTitle(ch), 2000)
    setTimeout(() => win?.setTitle('扫雷'), 3000)
  }
  ipcMain.on('game:over', () => flash('💥 踩雷了'))
  ipcMain.on('game:win', () => flash('🎉 获胜'))

  // 按持久化主题设置窗口背景色
  const settings = loadSettings()
  const bg = settings.theme === 'dark' ? '#1e1e1e' : '#ffffff'
  win?.setBackgroundColor(bg)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
