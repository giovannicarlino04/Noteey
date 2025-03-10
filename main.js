const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const crypto = require('crypto');
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
      enableRemoteModule: true,
      devTools: false // Disable DevTools in production
    },
    frame: false,
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Load the app
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  mainWindow.loadFile(indexPath).catch(() => {
    app.quit();
  });

  // Prevent opening DevTools with keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'i') {
      event.preventDefault();
      return true;
    }
  });
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}

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

// Utility functions for password hashing
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Theme handling
ipcMain.on('toggle-theme', (event, theme) => {
  store.set('theme', theme);
  event.reply('theme-changed', theme);
});

ipcMain.on('get-theme', (event) => {
  event.returnValue = store.get('theme', 'light');
});

// User authentication handling
ipcMain.handle('register', (event, { email, password }) => {
  try {
    const users = store.get('users', {});
    
    if (users[email]) {
      throw new Error('User already exists');
    }

    const { salt, hash } = hashPassword(password);
    users[email] = {
      email,
      salt,
      hash,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    store.set('users', users);
    return { email, name: users[email].name };
  } catch (error) {
    throw new Error(error.message);
  }
});

ipcMain.handle('login', (event, { email, password }) => {
  try {
    const users = store.get('users', {});
    const user = users[email];

    if (!user) {
      throw new Error('User not found');
    }

    if (!verifyPassword(password, user.salt, user.hash)) {
      throw new Error('Invalid password');
    }

    return { email, name: user.name };
  } catch (error) {
    throw new Error(error.message);
  }
});

ipcMain.handle('get-user', () => {
  try {
    return store.get('currentUser');
  } catch (error) {
    return null;
  }
});

ipcMain.handle('set-current-user', (event, user) => {
  try {
    store.set('currentUser', user);
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('logout', () => {
  try {
    store.delete('currentUser');
    return true;
  } catch (error) {
    return false;
  }
});

// Notes handling
ipcMain.handle('get-notes', (event) => {
  try {
    const currentUser = store.get('currentUser');
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return store.get(`notes_${currentUser.email}`, []);
  } catch (error) {
    throw new Error(error.message);
  }
});

ipcMain.handle('save-notes', (event, notes) => {
  try {
    const currentUser = store.get('currentUser');
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    store.set(`notes_${currentUser.email}`, notes);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
});

// Sync status handling
ipcMain.on('sync-status', (event, status) => {
  event.reply('sync-status-updated', status);
}); 