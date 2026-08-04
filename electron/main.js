const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');

let mainWindow;
let splashWindow;
let isAppReady = false;

// Evitar múltiples instancias
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

    app.on('ready', async () => {
        createSplashWindow();

        // 1. Configurar ruta de la BD para producción
        if (app.isPackaged) {
            const userDataPath = app.getPath('userData');
            process.env.DB_STORAGE = path.join(userDataPath, 'restaurant.db');
        }

        // 2. Iniciar el servidor backend (Node + Express + SQLite)
        splashWindow.webContents.send('message', 'Iniciando servidor local...');
        try {
            if (app.isPackaged) {
                const userDataPath = app.getPath('userData');
                const dbFolder = path.join(userDataPath, 'database');
                if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
                
                const targetDbPath = path.join(dbFolder, 'restaurant.db');
                const sourceDbPath = path.join(__dirname, '../database/restaurant.db');
                
                if (!fs.existsSync(targetDbPath) && fs.existsSync(sourceDbPath)) {
                    fs.copyFileSync(sourceDbPath, targetDbPath);
                    console.log("Database copied to userData on first run");
                }
                
                process.env.DB_STORAGE = targetDbPath;
                console.log("DB Path Set to:", process.env.DB_STORAGE);
            }
            // Requerimos el backend directamente
            require('../server/index.js');
        } catch (error) {
            console.error("Error al iniciar backend:", error);
            splashWindow.webContents.send('message', 'Error al iniciar servidor local');
        }

        // 3. Revisar actualizaciones si estamos en producción
        if (app.isPackaged) {
            splashWindow.webContents.send('message', 'Buscando actualizaciones...');
            autoUpdater.on('error', (err) => {
                console.log('Error de auto-update:', err);
            });
            autoUpdater.checkForUpdatesAndNotify().catch(err => {
                console.log("No se pudo buscar actualizaciones:", err);
            });
        } else {
            // En desarrollo, continuar
            setTimeout(createMainWindow, 2000);
        }
    });
}

autoUpdater.on('update-available', () => {
    if (splashWindow) splashWindow.webContents.send('message', 'Actualización encontrada. Descargando...');
});

autoUpdater.on('update-not-available', () => {
    if (splashWindow) splashWindow.webContents.send('message', 'Sistema actualizado. Abriendo app...');
    setTimeout(createMainWindow, 1000);
});

autoUpdater.on('error', (err) => {
    console.error('Error in auto-updater. ' + err);
    if (splashWindow) splashWindow.webContents.send('message', 'Error al buscar actualizaciones. Iniciando...');
    setTimeout(createMainWindow, 1500);
});

autoUpdater.on('update-downloaded', () => {
    if (splashWindow) splashWindow.webContents.send('message', 'Actualización descargada. Instalando...');
    setTimeout(() => {
        autoUpdater.quitAndInstall();
    }, 2000);
});

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 600,
        height: 450,
        transparent: false,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        backgroundColor: '#AB0030'
    });

    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
    splashWindow.on('closed', () => (splashWindow = null));
}

function createMainWindow() {
    if (isAppReady) return;
    isAppReady = true;

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        show: false, // Mostrar cuando esté cargada
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // FORCE LOAD DIST FOR TESTING
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[Renderer] ${message}`);
    });

    mainWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.close();
        }
        mainWindow.maximize();
        mainWindow.show();
    });

    mainWindow.on('closed', () => (mainWindow = null));
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});