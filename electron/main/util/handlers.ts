import {type HandlerExport} from 'electron/types';
import {launchGame} from './manager';

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

	console.log(selectedCheckboxes);
}

async function clickRefresh(
	event: Electron.IpcMainInvokeEvent,
	...args: any[]
) {
	console.log('refresh mods');
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
];

export default handlers;
