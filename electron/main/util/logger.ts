import {} from 'electron';
function sendToConsole(data: string, color: string) {
	console.log(data);
	mainWindow?.webContents.send('toConsole', {data, color});
}

const info = (data: any) => {
	const toLog = `[INFO]: ${data}`;
	sendToConsole(toLog, '#ff0000');
};

const error = (data: any) => {
	const toLog = `[ERROR]: ${data}`;
	sendToConsole(toLog, '#ff0000');
	mainWindow?.webContents.send('openNotification', {title: 'An Error Occured', body: `${data}`});
};

export default {info, error};
