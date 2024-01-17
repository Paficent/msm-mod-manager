type handlerExport = {
  channel: string;
  listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any;
};

export type { handlerExport };
