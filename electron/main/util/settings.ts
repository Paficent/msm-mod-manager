import {type ModManagerSetting} from 'electron/types';
import {writeFileSync, readFileSync, existsSync, mkdirSync} from 'node:fs';
import {platform, homedir} from 'node:os';
import {join} from 'node:path';

function getAppDirectory(): string {
	function getAppData(): string {
		if (process.env.AppData !== undefined && typeof (process.env.AppData) === 'string') {
			return process.env.AppData;
		}

		return '';
	}

	if (platform() === 'win32') {
		return join(getAppData(), 'MSM_ModManager');
	}

	return join(homedir(), 'MSM_ModManager');
}

global.appDirectory = getAppDirectory();
const settingsPath: string = join(appDirectory, 'settings.json');

function checkIfSettingsExists(): void {
	try {
		if (!existsSync(appDirectory)) {
			mkdirSync(appDirectory);
		}

		if (!existsSync(settingsPath)) {
			resetSettings();
		}

		readSettings();
	} catch (error) {
		console.error('Error checking/creating settings file:', error);
	}
}

function resetSettings(): void {
	writeSettings({
		msmDirectory: '',
		debugMode: false,
		ignoreConflicts: true,
		disableUnsafeLuaFunctions: true,
		closeAfterLaunch: false,
		discordAutoJoin: true,
	});
}

function readSettings(): void {
	try {
		const content = readFileSync(settingsPath);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		global.settings = JSON.parse(content.toString());
	} catch (error) {
		console.error('Error reading settings file:', error);
	}
}

function writeSettings(newSettings: ModManagerSetting): void {
	try {
		global.settings = newSettings;
		writeFileSync(settingsPath, JSON.stringify(newSettings));
	} catch (error) {
		console.error('Error writing settings file:', error);
	}
}

export {
	checkIfSettingsExists,
	resetSettings,
	readSettings,
	writeSettings,
};
