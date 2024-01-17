import { handlerExport } from "electron/types";

async function checkbox_changed(
  event: Electron.IpcMainInvokeEvent,
  ...args: any[]
) {
  console.log(args);
  return;
}

const handlers: handlerExport[] = [
  {
    channel: "checkbox_changed",
    listener: checkbox_changed,
  },
];

export default handlers;
