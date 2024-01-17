/* eslint-disable no-var */
import {type ModManagerSetting} from 'electron/types';

import {app, BrowserWindow} from 'electron';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import axios from 'axios';

import {checkIfSettingsExists} from './util/settings';
import {addListeners} from './ipcMain';
import {fixGame} from './util/manager';

declare global {
	var mainWindow: undefined | BrowserWindow;
	var settings: ModManagerSetting;
	var appDirectory: string;
	var checkboxes: unknown;
}

const width = 1000;
const height = 800;

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

global.mainWindow = undefined;
const preload = join(__dirname, '../preload/index.mjs');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

async function createWindow(): Promise<void> {
	mainWindow = new BrowserWindow({
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

	checkIfSettingsExists();

	await fixGame();

	if (url) {
		await mainWindow.loadURL(url);
		mainWindow.webContents.openDevTools({mode: 'detach'});
	} else {
		await mainWindow.loadFile(indexHtml);
		await joinDiscord();
	}

	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
	});

	await addListeners();
}

void app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	mainWindow = undefined;
	app.quit();
});

app.on('activate', async () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length > 0) {
		allWindows[0].focus();
	} else {
		await createWindow();
	}
});

