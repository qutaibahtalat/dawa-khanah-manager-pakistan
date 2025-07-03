const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Splash window
  const splash = new BrowserWindow({
    width: 400,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    show: true,
    center: true,
    icon: path.join(__dirname, 'icon.png'),
  });
  splash.loadFile(path.join(__dirname, 'splash.html'));

  // Main window (hidden initially)
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    show: false,
  });

  // Always load the built React app in production, only use localhost in dev mode
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:8080');
  } else {
    const prodPath = path.join(app.getAppPath(), 'dist', 'index.html');
    win.loadFile(prodPath);
  }

  // Show main window when ready, close splash
  win.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy();
      win.show();
    }, 900); // keep splash for at least 900ms for visual effect
  });

  // IPC handler for folder dialog
  const { ipcMain, dialog } = require('electron');
  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return result.filePaths[0];
  });
}


app.whenReady().then(() => {
  createWindow();

  // Enable auto-launch at startup (Windows)
  if (process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
      args: []
    });
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
