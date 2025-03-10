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

// Funzioni di utilità per la crittografia
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve({
        hash: derivedKey.toString('hex'),
        salt
      });
    });
  });
}

function verifyPassword(password, hash, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === hash);
    });
  });
}

// Gestione utenti
ipcMain.handle('register', async (event, { username, password }) => {
  try {
    const users = store.get('users', []);
    if (users.some(user => user.username === username)) {
      throw new Error('Username già in uso');
    }

    const { hash, salt } = await hashPassword(password);
    const newUser = {
      id: crypto.randomBytes(16).toString('hex'),
      username,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    store.set('users', users);
    return { success: true, user: { id: newUser.id, username: newUser.username } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('login', async (event, { username, password }) => {
  try {
    const users = store.get('users', []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('Utente non trovato');
    }

    const isValid = await verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error('Password non valida');
    }

    return { success: true, user: { id: user.id, username: user.username } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-user', async () => {
  try {
    const currentUser = store.get('currentUser');
    if (!currentUser) return null;

    const users = store.get('users', []);
    const user = users.find(u => u.id === currentUser.id);
    return user ? { id: user.id, username: user.username } : null;
  } catch (error) {
    console.error('Errore nel recupero dell\'utente:', error);
    return null;
  }
});

ipcMain.handle('set-user', async (event, user) => {
  try {
    store.set('currentUser', user);
    return true;
  } catch (error) {
    console.error('Errore nel salvataggio dell\'utente:', error);
    return false;
  }
});

ipcMain.handle('logout', async () => {
  try {
    store.delete('currentUser');
    return true;
  } catch (error) {
    console.error('Errore nel logout:', error);
    return false;
  }
});

// Gestione note
ipcMain.handle('get-notes', async (event, userId) => {
  try {
    const notes = store.get('notes', []);
    return notes.filter(note => note.userId === userId);
  } catch (error) {
    console.error('Errore nel recupero delle note:', error);
    return [];
  }
});

ipcMain.handle('save-note', async (event, note) => {
  try {
    const notes = store.get('notes', []);
    const index = notes.findIndex(n => n.id === note.id);
    
    if (index === -1) {
      notes.push(note);
    } else {
      notes[index] = note;
    }
    
    store.set('notes', notes);
    return { success: true, note };
  } catch (error) {
    console.error('Errore nel salvataggio della nota:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-note', async (event, noteId) => {
  try {
    const notes = store.get('notes', []);
    const filteredNotes = notes.filter(note => note.id !== noteId);
    store.set('notes', filteredNotes);
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'eliminazione della nota:', error);
    return { success: false, error: error.message };
  }
});

// Theme handling
ipcMain.on('toggle-theme', (event, theme) => {
  store.set('theme', theme);
  event.reply('theme-changed', theme);
});

ipcMain.on('get-theme', (event) => {
  event.returnValue = store.get('theme', 'light');
});

// Sync status handling
ipcMain.on('sync-status', (event, status) => {
  event.reply('sync-status-updated', status);
}); 