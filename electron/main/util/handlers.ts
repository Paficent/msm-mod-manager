import {type InstallExport, type HandlerExport} from 'electron/types';
import {launchGame} from './backend';
import {installMod} from './file';
import logger from './logger';

const selectedCheckboxes: string[] = [];

async function checkboxChanged(
	event: Electron.IpcMainInvokeEvent,
	...args: [{key: string; state: boolean}]
) {
	const checkboxArgs = args[0];
	if (selectedCheckboxes.includes(checkboxArgs.key)) {
		const index = selectedCheckboxes.indexOf(checkboxArgs.key);
		selectedCheckboxes.splice(index, 1);
	} else {
		selectedCheckboxes.push(checkboxArgs.key);
	}

	logger.info(selectedCheckboxes);
}

async function clickRefresh(
	event: Electron.IpcMainInvokeEvent,
	...args: any[]
) {
	logger.info('refresh mods');
}

async function clickLaunch(
	event: Electron.IpcMainInvokeEvent,
	...args: any[]
) {
	await launchGame();
}

async function clickMinimize(
	event: Electron.IpcMainInvokeEvent,
	...args: any[]
) {
	if (mainWindow?.isMinimizable) {
		mainWindow?.minimize();
	}
}

async function clickResize(
	event: Electron.IpcMainInvokeEvent,
	...args: any[]
) {
	if (mainWindow?.isMaximizable && !mainWindow.isMaximized()) {
		mainWindow?.maximize();
	} else if (mainWindow?.isMaximized()) {
		mainWindow.unmaximize();
	}
}

async function clickClose(event: Electron.IpcMainInvokeEvent, ...args: any[]): Promise<void> {
	if ((mainWindow?.isClosable) !== null) {
		mainWindow?.close();
	}
}

async function clickInstall(event: Electron.IpcMainInvokeEvent, ...args: [InstallExport]): Promise<void> {
	const info = args[0];
	function formatString(str: string) {
		return encodeURI(str.toLowerCase().replaceAll(' ', '-'));
	}

	const savePath = `${formatString(info.author)}__${formatString(info.name)}`;
	await installMod(savePath, info);
}

const handlers: HandlerExport[] = [
	// Mod Card Handlers
	{
		channel: 'checkboxChanged',
		listener: checkboxChanged,
	},

	// StatusBar Handlers
	{
		channel: 'clickRefresh',
		listener: clickRefresh,
	},
	{
		channel: 'clickLaunch',
		listener: clickLaunch,
	},

	// Window Button Handlers
	{
		channel: 'clickMinimize',
		listener: clickMinimize,
	},
	{
		channel: 'clickResize',
		listener: clickResize,
	},
	{
		channel: 'clickClose',
		listener: clickClose,
	},

	// Others
	{
		channel: 'clickInstall',
		listener: clickInstall,
	},
];

export default handlers;
