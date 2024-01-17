type HandlerExport = {
	channel: string;
	listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any;
};

type ModManagerSetting = {
	msmDirectory: string;
	debugMode: boolean;
	ignoreConflicts: boolean;
	disableUnsafeLuaFunctions: boolean;
	closeAfterLaunch: boolean;
	discordAutoJoin: boolean;
};

export type {HandlerExport, ModManagerSetting};
