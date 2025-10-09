// Ventana principal, menú, ciclo de vida
const mainWindow = new BrowserWindow({
  width: 1366,
  height: 768,
  resizable: false, // ✅ No se puede redimensionar
  fullscreen: false,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js')
  }
});