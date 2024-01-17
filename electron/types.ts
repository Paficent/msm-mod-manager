type HandlerExport = {
	channel: string;
	listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any;
};

export type {HandlerExport};
