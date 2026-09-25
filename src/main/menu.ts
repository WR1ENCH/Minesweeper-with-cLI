import type { MenuItemConstructorOptions } from 'electron'

export function buildMenu(getWin: () => Electron.BrowserWindow | null): MenuItemConstructorOptions[] {
  const send = (channel: string): void => {
    const win = getWin()
    win?.webContents.send(channel)
  }
  const template: MenuItemConstructorOptions[] = [
    {
      label: '游戏',
      submenu: [
        { label: '新游戏', accelerator: 'F2', click: () => send('menu:new-game') },
        { type: 'separator' },
        { label: '初级', accelerator: 'CmdOrCtrl+1', click: () => send('menu:difficulty-beginner') },
        { label: '中级', accelerator: 'CmdOrCtrl+2', click: () => send('menu:difficulty-intermediate') },
        { label: '专家', accelerator: 'CmdOrCtrl+3', click: () => send('menu:difficulty-expert') },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '设置',
      submenu: [
        { label: '浅色主题', accelerator: 'CmdOrCtrl+Shift+L', click: () => send('menu:theme-light') },
        { label: '深色主题', accelerator: 'CmdOrCtrl+Shift+D', click: () => send('menu:theme-dark') },
        { label: '跟随系统', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('menu:theme-system') },
        { type: 'separator' },
        { label: '经典皮肤', accelerator: 'CmdOrCtrl+Shift+W', click: () => send('menu:skin-classic') },
        { label: '现代皮肤', accelerator: 'CmdOrCtrl+Shift+M', click: () => send('menu:skin-modern') }
      ]
    }
  ]
  return template
}
