import {ipcMain} from 'electron';
import handlers from './util/handlers';
import {type HandlerExport} from 'electron/types';

async function addListeners(): Promise<void> {
	handlers.forEach((handler: HandlerExport) => {
		ipcMain.handle(handler.channel, handler.listener);
	});
}

export {addListeners};
