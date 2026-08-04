const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const http = require('http');

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

        // Paso 1: Configurar DB (20%)
        sendProgress(10, 'Preparando base de datos...');
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

        // Paso 2: Iniciar backend (40%)
        sendProgress(30, 'Iniciando servidor local...');
        try {
            require('../server/index.js');
        } catch (error) {
            console.error("Error al iniciar backend:", error);
            sendProgress(30, 'Error al iniciar servidor local');
        }

        // Paso 3: Esperar a que el servidor esté listo (60%)
        sendProgress(50, 'Conectando servicios...');
        await waitForServer('http://localhost:3001/api/health', 15000);
        
        sendProgress(70, 'Cargando interfaz...');

        // Paso 4: Verificar actualizaciones silenciosamente (solo en producción)
        if (app.isPackaged) {
            sendProgress(80, 'Verificando actualizaciones...');
            try {
                await autoUpdater.checkForUpdatesAndNotify();
            } catch (err) {
                console.log("Auto-update check failed (silenced):", err.message);
            }
            // Si hay actualización disponible, los listeners de abajo se encargan
            // Si no hay, continuamos
            if (!isAppReady) {
                sendProgress(95, 'Abriendo aplicación...');
                setTimeout(createMainWindow, 500);
            }
        } else {
            // En desarrollo
            sendProgress(95, 'Abriendo aplicación...');
            setTimeout(createMainWindow, 800);
        }
    });
}

// --- Auto Updater (silencioso) ---
autoUpdater.on('update-available', () => {
    sendProgress(85, 'Actualización encontrada. Descargando...');
});

autoUpdater.on('update-not-available', () => {
    if (!isAppReady) {
        sendProgress(95, 'Sistema actualizado. Abriendo...');
        setTimeout(createMainWindow, 500);
    }
});

autoUpdater.on('error', (err) => {
    console.log('Auto-update error (silenced):', err.message);
    // No mostrar error al usuario, simplemente continuar
    if (!isAppReady) {
        sendProgress(95, 'Abriendo aplicación...');
        setTimeout(createMainWindow, 500);
    }
});

autoUpdater.on('update-downloaded', () => {
    sendProgress(100, 'Actualización lista. Reiniciando...');
    setTimeout(() => {
        autoUpdater.quitAndInstall();
    }, 2000);
});

// --- Helper: Enviar progreso al splash ---
function sendProgress(percent, message) {
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.webContents.send('progress', percent);
        splashWindow.webContents.send('message', message);
    }
}

// --- Helper: Esperar a que el servidor responda ---
function waitForServer(url, timeout) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const check = () => {
            http.get(url, (res) => {
                if (res.statusCode === 200) {
                    resolve(true);
                } else {
                    retry();
                }
            }).on('error', () => {
                retry();
            });
        };
        const retry = () => {
            if (Date.now() - startTime > timeout) {
                console.log('Server health check timeout, continuing anyway...');
                resolve(false);
            } else {
                setTimeout(check, 300);
            }
        };
        check();
    });
}

// --- Splash Window ---
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

// --- Main Window ---
function createMainWindow() {
    if (isAppReady) return;
    isAppReady = true;

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        show: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`[Renderer] ${message}`);
    });

    // Esperar a que el contenido web esté completamente cargado
    mainWindow.webContents.on('did-finish-load', () => {
        // Dar un momento extra para que React se monte y haga las primeras peticiones
        setTimeout(() => {
            sendProgress(100, 'Listo');
            setTimeout(() => {
                if (splashWindow && !splashWindow.isDestroyed()) {
                    splashWindow.close();
                }
                mainWindow.maximize();
                mainWindow.show();
            }, 400);
        }, 1500);
    });

    mainWindow.on('closed', () => (mainWindow = null));
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});