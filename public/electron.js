const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const express = require('express')();
const bodyParser = require('body-parser');
const path = require('path');
const env = require('./env');
const ws = require('ws');

let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    title: 'Ambeeance',
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  //load the index.html from a url
  win.loadURL(
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`,
  );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let config = {};
const sockets = [];

ipcMain.on('config', (evt, arg) => {
  config = arg;
  sockets.forEach((s) => {
    try {
      s.send(JSON.stringify(config));
    } catch (ignored) {}
  });
});

express.use(bodyParser.json());

express.get('/', function (req, res) {
  res.send(config);
});

express.post('/autospec', function (req, res) {
  sendAutoSpec(req.body);
  res.status(200).send();
});

const wsServer = new ws.Server({ noServer: true });

const sendAutoSpec = (specs) => {
  if (win) {
    specs = specs.map(({ key, value }) => ({ key, value }));
    win.webContents.send('autospec', specs);
  }
};

wsServer.on('connection', (socket) => {
  socket.on('message', (msg) => {
    console.log(msg);
    const { type, args } = JSON.parse(msg);
    if (type === 'AUTOSPEC') {
      sendAutoSpec(args);
    }
  });
  sockets.push(socket);
  socket.send(JSON.stringify(config));
});

const server = express.listen(env.expressPort);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit('connection', socket, request);
  });
});
