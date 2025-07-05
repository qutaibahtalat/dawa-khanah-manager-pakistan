const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const http = require('http');

let backendProcess = null;
let detectedBaseUrl = null;

// Utility: scan LAN for backend server
async function findBackendServerOnLAN(port = 3004, timeout = 500) {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const ip = iface.address.split('.');
        for (let i = 2; i < 255; i++) {
          candidates.push(`${ip[0]}.${ip[1]}.${ip[2]}.${i}`);
        }
      }
    }
  }
  return new Promise((resolve) => {
    let found = false;
    let checked = 0;
    for (const candidate of candidates) {
      const req = http.get({
        hostname: candidate,
        port,
        path: '/api/health',
        timeout,
      }, (res) => {
        if (res.statusCode === 200 && !found) {
          found = true;
          resolve(`http://${candidate}:${port}/api`);
        }
      });
      req.on('error', () => {
        checked++;
        if (checked === candidates.length && !found) resolve(null);
      });
      req.on('timeout', () => {
        req.destroy();
        checked++;
        if (checked === candidates.length && !found) resolve(null);
      });
    }
    if (candidates.length === 0) resolve(null);
  });
}

async function startBackendIfNeeded() {
  detectedBaseUrl = await findBackendServerOnLAN();
  if (!detectedBaseUrl) {
    // Start backend locally
    const backendPath = path.join(app.getAppPath(), 'backend', 'server.js');
    backendProcess = spawn(process.execPath, [backendPath], {
      cwd: path.join(app.getAppPath(), 'backend'),
      detached: true,
      stdio: 'ignore',
    });
    detectedBaseUrl = 'http://localhost:3004/api';
    // Give backend time to start
    await new Promise(res => setTimeout(res, 1000));
  }
}

function createWindow() {
  // Add error logging
  const logError = (msg, error) => {
    console.error(`Electron Error: ${msg}`, error);
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.send('error', { message: msg, error: error?.message });
    }
  };

  // Splash window
  const splash = new BrowserWindow({
    width: 500,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    resizable: false,
    center: true,
    show: true,
  });
  
  try {
    const splashPath = path.join(__dirname, 'splash.html');
    console.log('Loading splash from:', splashPath);
    splash.loadFile(splashPath);
  } catch (error) {
    logError('Failed to load splash screen', error);
  }

  // Main window (hidden at first)
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Mindspire Pharmacy POS',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--backendBaseUrl=${detectedBaseUrl}`],
      nodeIntegrationInSubFrames: false,
      nodeIntegrationInWorker: false
    }
  });

  try {
    // Try different paths for index.html
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    console.log('Attempting to load index.html from:', indexPath);
    win.loadFile(indexPath)
      .catch(error => {
        logError('Failed to load index.html', error);
        // Try fallback path
        const fallbackPath = path.join(__dirname, 'dist', 'index.html');
        console.log('Falling back to:', fallbackPath);
        win.loadFile(fallbackPath)
          .catch(error => logError('Failed to load fallback index.html', error));
      });

    // Add error handling for preload script
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      logError('Failed to load page', { errorCode, errorDescription });
    });

    // Add error handling for renderer process
    win.webContents.on('crashed', () => {
      logError('Renderer process crashed');
    });

  } catch (error) {
    logError('Error creating main window', error);
  }

  // After splash delay, show main window and close splash
  setTimeout(() => {
    splash.close();
    win.show();
  }, 2800);
}

app.whenReady().then(async () => {
  await startBackendIfNeeded();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
