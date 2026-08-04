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
        if (!isDev) {
            const userDataPath = app.getPath('userData');
            process.env.DB_STORAGE = path.join(userDataPath, 'restaurant.db');
        }

        // 2. Iniciar el servidor backend (Node + Express + SQLite)
        splashWindow.webContents.send('message', 'Iniciando servidor local...');
        try {
            // Requerimos el backend directamente
            require('../server/index.js');
        } catch (error) {
            console.error("Error al iniciar backend:", error);
            splashWindow.webContents.send('message', 'Error al iniciar servidor local');
        }

        // 3. Revisar actualizaciones si estamos en producción
        if (!isDev) {
            splashWindow.webContents.send('message', 'Buscando actualizaciones...');
            autoUpdater.checkForUpdatesAndNotify();
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

    if (isDev) {
        // En desarrollo, apuntamos a Vite
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // En producción, cargamos el build de React
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

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