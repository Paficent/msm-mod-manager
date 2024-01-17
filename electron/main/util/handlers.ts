import {type handlerExport} from 'electron/types';

async function checkboxChanged(
	event: Electron.IpcMainInvokeEvent,
	...args: any[]
) {
	console.log(args);
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
	console.log('Launch Game');
}

async function clickMinimize(
	event: Electron.IpcMainInvokeEvent,
	...args: any[]
) {
	if (win?.isMinimizable) {
		win?.minimize();
	}
}

async function clickResize(
	event: Electron.IpcMainInvokeEvent,
	...args: any[]
) {
	if (win?.isMaximizable && !win.isMaximized()) {
		win?.maximize();
	} else if (win?.isMaximized()) {
		win.unmaximize();
	}
}

async function clickClose(event: Electron.IpcMainInvokeEvent, ...args: any[]): Promise<void> {
	if ((win?.isClosable) !== null) {
		win?.close();
	}
}

const handlers: handlerExport[] = [
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
