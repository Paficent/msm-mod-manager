
import {app, BrowserWindow} from 'electron';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import axios from 'axios';
import path from 'path';
import os from 'os';
import fs from 'fs';

import {addListeners} from './ipcMain';

declare global {
	// eslint-disable-next-line no-var
	var win: undefined | BrowserWindow;
}

const width = 1000;
const height = 800;

const isDev = app.isPackaged;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.DIR_NAME = __dirname;
process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = (process.env.VITE_DEV_SERVER_URL)
	? join(process.env.DIST_ELECTRON, '../public')
	: process.env.DIST;

if (process.platform === 'win32') {
	app.setAppUserModelId(app.getName());
}

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

function getAppDirectory(): string {
	function getAppData(): string {
		if (process.env.AppData !== undefined && typeof (process.env.AppData) === 'string') {
			return process.env.AppData;
		}

		return '';
	}

	if (os.platform() === 'win32') {
		return path.join(getAppData(), 'MSM_ModManager');
	}

	return path.join(os.homedir(), 'MSM_ModManager');
}

const appDirectory = getAppDirectory();

const settingsPath = path.join(appDirectory, 'settings.json');
const settings = {
	checkIfExists(): void {
		try {
			if (!fs.existsSync(appDirectory)) {
				fs.mkdirSync(appDirectory);
			}

			if (!fs.existsSync(settingsPath)) {
				settings.reset();
			}
		} catch (error) {
			console.error('Error checking/creating settings file:', error);
		}
	},
	reset(): void {
		settings.write({
			msmDirectory: '',
			debugMode: false,
			ignoreConflicts: true,
			disableUnsafeLuaFunctions: true,
			closeAfterLaunch: false,
			discordAutoJoin: true,
		});
	},
	read(): any {
		try {
			const content = fs.readFileSync(settingsPath, 'utf-8');
			return JSON.parse(content);
		} catch (error) {
			console.error('Error reading settings file:', error);
			return undefined;
		}
	},
	write(settings: Record<string, unknown>) {
		try {
			fs.writeFileSync(settingsPath, JSON.stringify(settings));
		} catch (error) {
			console.error('Error writing settings file:', error);
		}
	},
};

async function joinDiscord(): Promise<void> {
	async function tryRequest(port: string | number): Promise<void> {
		const options = {
			method: 'POST',
			url: `http://127.0.0.1:${port}/rpc`,
			params: {v: '1'},
			headers: {
				'Content-Type': 'application/json',
				origin: 'https://discord.com',
			},
			data: {args: {code: 'pERjuvwTG6'}, cmd: 'INVITE_BROWSER', nonce: '.'},
		};
		await axios.request(options).catch(err => {
			console.error(err);
		});
	}

	for (let i = 0; i < 10; i++) {
		void tryRequest(6463 + i);
	}
}

global.win = undefined;
const preload = join(__dirname, '../preload/index.mjs');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

async function createWindow(): Promise<void> {
	win = new BrowserWindow({
		width,
		height,
		minHeight: 425,
		minWidth: 800,

		frame: false,
		icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
		webPreferences: {
			preload,
		},
	});

	if (url) {
		await win.loadURL(url);
		win.webContents.openDevTools({mode: 'detach'});
	} else {
		await win.loadFile(indexHtml);
	}

	win.webContents.on('did-finish-load', () => {
		win?.webContents.send('main-process-message', new Date().toLocaleString());
	});

	if (isDev) {
		await joinDiscord();
	}

	await addListeners();
}

void app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	win = undefined;
	app.quit();
});

app.on('activate', () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length > 0) {
		allWindows[0].focus();
	} else {
		void createWindow();
	}
});
