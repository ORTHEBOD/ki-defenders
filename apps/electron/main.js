// The PC app (Electron). The game files are packed inside the app in the `game/` folder
// and served from a private app:// address (the game's ES modules can't load from file://).
const { app, BrowserWindow, Menu, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

const root = path.join(__dirname, 'game');

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    let file = decodeURIComponent(new URL(request.url).pathname);
    if (file === '/') file = '/index.html';
    const full = path.join(root, path.normalize(file));
    if (!full.startsWith(root)) return new Response('Not allowed', { status: 403 });
    return net.fetch(pathToFileURL(full).toString());
  });

  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 640,
    minHeight: 380,
    backgroundColor: '#07090f',
    title: 'Ki Defenders',
    icon: path.join(root, 'icons', 'icon-512.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  win.loadURL('app://game/index.html');

  // F11 = full screen
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') win.setFullScreen(!win.isFullScreen());
  });
  // No pop-up windows
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
});

app.on('window-all-closed', () => app.quit());
