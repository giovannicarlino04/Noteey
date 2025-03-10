const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

// Disable hardware acceleration
app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: false,
    titleBarStyle: 'hiddenInset'
  });

  // Always open DevTools
  mainWindow.webContents.openDevTools();

  // Handle errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('crashed', (event) => {
    console.error('Window crashed:', event);
  });

  mainWindow.on('unresponsive', () => {
    console.error('Window unresponsive');
  });

  // Load the app
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Loading file:', indexPath);
  mainWindow.loadFile(indexPath).catch(err => {
    console.error('Error loading file:', err);
  });
}

app.whenReady().then(createWindow);

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

// Theme handling
ipcMain.on('toggle-theme', (event, theme) => {
  store.set('theme', theme);
  event.reply('theme-changed', theme);
});

// Sync theme getter
ipcMain.on('get-theme', (event) => {
  event.returnValue = store.get('theme', 'light');
});

// User authentication handling
ipcMain.on('save-user', (event, user) => {
  store.set('user', user);
});

ipcMain.on('clear-user', () => {
  store.delete('user');
});

// Sync user getter
ipcMain.on('get-user', (event) => {
  event.returnValue = store.get('user');
});

// Notes handling
ipcMain.handle('get-notes', () => {
  return store.get('notes', []);
});

ipcMain.handle('save-notes', (event, notes) => {
  store.set('notes', notes);
  return true;
});

// Sync status handling
ipcMain.on('sync-status', (event, status) => {
  event.reply('sync-status-updated', status);
}); 