const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const si = require("systeminformation");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../renderer/dashboard.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
  win.webContents.openDevTools();
}

function sendOSData() {
  si.osInfo().then(data => {
    if (win) {
      win.webContents.send("os-data", data.platform);
    }
  });
  si.cpu().then(data => {
    if (win) {
      win.webContents.send("cpu-brand", data.manufacturer + " " + data.brand);
    }
  });
}

// Enviar dados da CPU a cada 1s
setInterval(async () => {
  const load = await si.currentLoad();
  if (win) {
    win.webContents.send("cpu-data", {
      total: load.currentLoad.toFixed(2),
      cores: load.cpus.map(c => c.load.toFixed(2))
    });
  }
}, 2000);

sendOSData();
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
