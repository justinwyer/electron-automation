import { app, BrowserWindow, ipcMain, session } from "electron";
import * as path from "path";
import { Events } from "./events";

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      session: session.defaultSession,
      nodeIntegration: false,
    },
    width: 1800,
  });
  await mainWindow.loadURL('https://some.domain/page');
  mainWindow.webContents.openDevTools();
}

app.on("ready", async () => {
  await session.defaultSession.cookies.set({
    url: 'https://some.domain/',
    name: 'security-cookie',
    value: 'value',
    path: '/',
    domain: 'some.domain',
    httpOnly: true,
    secure: true,
    sameSite: 'no_restriction'
  })
  await createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on(Events.JOB_FOUND, (event, args) => {
  mainWindow?.webContents?.send(Events.RUN_JOB, args);
  console.log(`run job ${args}`)
})
