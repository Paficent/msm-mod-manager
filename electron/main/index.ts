import { app, BrowserWindow, shell } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";
import path from "path";
import os from "os";
import fs from "fs";

import { addListeners } from "./ipcMain";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.DIR_NAME = __dirname;
process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

function getAppDirectory(): string {
  function getAppData(): string {
    if (process.env.AppData) {
      return process.env.AppData;
    }
    return "";
  }

  if (os.platform() === "win32") {
    return path.join(getAppData(), "MSM_ModManager");
  } else {
    return path.join(os.homedir(), "MSM_ModManager");
  }
}

const AppDirectory = getAppDirectory();

const settingsPath = path.join(AppDirectory, "settings.json");
const settings = {
  checkIfExists: function () {
    try {
      if (!fs.existsSync(AppDirectory)) {
        fs.mkdirSync(AppDirectory);
      }
      if (!fs.existsSync(settingsPath)) {
        settings.reset();
      }
    } catch (error) {
      console.error("Error checking/creating settings file:", error);
    }
  },
  reset: function () {
    settings.write({
      msm_directory: "",
      debug_mode: false,
      ignore_conflicts: true,
      disable_unsafe_lua_functions: true,
      close_after_launch: false,
      discord_auto_join: true,
    });
  },
  read: function () {
    try {
      const content = fs.readFileSync(settingsPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Error reading settings file:", error);
      return null;
    }
  },
  write: function (settings: {}) {
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(settings));
    } catch (error) {
      console.error("Error writing settings file:", error);
    }
  },
};

async function joinDiscord() {
  async function tryRequest(port: string | number) {
    var options = {
      method: "POST",
      url: `http://127.0.0.1:${port}/rpc`,
      params: { v: "1" },
      headers: {
        "Content-Type": "application/json",
        origin: "https://discord.com",
      },
      data: { args: { code: "pERjuvwTG6" }, cmd: "INVITE_BROWSER", nonce: "." },
    };
    await axios.request(options).catch(function (err) {
      return;
    });
  }
  for (let i = 0; i < 10; i++) {
    tryRequest(6463 + i);
  }
}

let win: BrowserWindow | null = null;
const preload = join(__dirname, "../preload/index.mjs");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    frame: false,
    icon: join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
    },
  });

  if (url) {
    win.loadURL(url);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(indexHtml);
  }

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  joinDiscord().then();
  addListeners().then();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  app.quit();
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
