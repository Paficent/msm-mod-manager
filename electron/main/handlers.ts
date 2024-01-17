import { handlerExport } from "electron/types";

async function checkbox_changed(
  event: Electron.IpcMainInvokeEvent,
  ...args: any[]
) {
  console.log(args);
  return;
}

async function click_refresh(
  event: Electron.IpcMainInvokeEvent,
  ...args: any[]
) {
  console.log("refresh mods");
}

async function click_launch(
  event: Electron.IpcMainInvokeEvent,
  ...args: any[]
) {
  console.log("Launch Game");
}

async function click_minimize(
  event: Electron.IpcMainInvokeEvent,
  ...args: any[]
) {
  if (win?.isMinimizable) {
    win?.minimize();
  }
}
async function click_resize(
  event: Electron.IpcMainInvokeEvent,
  ...args: any[]
) {
  if (win?.isMaximizable && !win.isMaximized()) {
    win?.maximize();
  } else if (win?.isMaximized()) {
    win.unmaximize();
  }
}
async function click_close(event: Electron.IpcMainInvokeEvent, ...args: any[]) {
  if (win?.isClosable) {
    win?.close();
  }
}

const handlers: handlerExport[] = [
  //Mod Card Handlers
  {
    channel: "checkbox_changed",
    listener: checkbox_changed,
  },

  // StatusBar Handlers
  {
    channel: "click_refresh",
    listener: click_refresh,
  },
  {
    channel: "click_launch",
    listener: click_launch,
  },

  // Window Button Handlers
  {
    channel: "click_minimize",
    listener: click_minimize,
  },
  {
    channel: "click_resize",
    listener: click_resize,
  },
  {
    channel: "click_close",
    listener: click_close,
  },
];

export default handlers;
