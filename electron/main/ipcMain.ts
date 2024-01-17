import { ipcMain } from "electron";
import handlers from "./util/handlers";
import { handlerExport } from "electron/types";

async function addListeners() {
  handlers.forEach((handler: handlerExport) => {
    ipcMain.handle(handler.channel, handler.listener);
  });
}
export { addListeners };
