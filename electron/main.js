const { app, BrowserWindow, shell } = require('electron');

let mainWindow;

const GAME_URL = 'https://csgo-case-sim-production.up.railway.app';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Case Sim — N Games',
    backgroundColor: '#0f0f0f',
    autoHideMenuBar: true,
    show: false,
    icon: undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(GAME_URL);

  // Show window once content is ready (avoids white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Retry on load failure (offline, server cold start)
  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.log(`[Load failed] ${code}: ${desc} — retrying in 3s...`);
    setTimeout(() => {
      mainWindow.loadURL(GAME_URL);
    }, 3000);
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http') && !url.includes('railway.app')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock — prevent multiple copies
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', () => {
    createWindow();
  });
}

app.on('window-all-closed', () => {
  app.quit();
});
