import {
	writeFile,
	readFile,
	copyFile,
	unlink,
	mkdir,
	readdir,
} from 'node:fs/promises';
import {existsSync, readFileSync} from 'node:fs';
import {join, dirname, parse, sep, isAbsolute} from 'node:path';
import {exec, spawn, type ChildProcess} from 'child_process';
import {dialog} from 'electron';
import {promisify} from 'util';
import logger from './logger';
import {sync} from 'rimraf';

type Item = [string, string];
type Asset = [string, string];
type Fix = {assets: Asset[]};

const execAsync = promisify(exec);

async function createSubdirectoriesIfNotExist(dirPath: string): Promise<void> {
	const subdirectories = parse(dirPath).dir.split(sep).slice(1);

	let currentPath = isAbsolute(dirPath) ? sep : '';
	const mkdirPromises: Array<Promise<void>> = [];

	for (const subdirectory of subdirectories) {
		currentPath = join(currentPath, subdirectory);

		if (!existsSync(currentPath)) {
			mkdirPromises.push(mkdir(currentPath));
		}
	}

	await Promise.all(mkdirPromises);
}

async function deleteEmptyDirectories(
	filePath: string,
	originalPath: string,
): Promise<void> {
	const parentDir = dirname(filePath);

	try {
		const files = await readdir(parentDir);

		if (files.length === 0) {
			logger.info(
				`Removing ${originalPath.substring(0, originalPath.lastIndexOf('/'))}`,
			);
			sync(parentDir);
		}
	} catch (err) {
		logger.error(getErrorMessage(err));
	}
}

async function readJsonFile(filePath: string): Promise<any> {
	try {
		const fileContent = await readFile(filePath);
		return JSON.parse(fileContent.toString()) as JSON;
	} catch (err) {
		return null;
	}
}

async function processAssets(
	assets: Asset[],
	fix: Fix,
	modPath: string,
	msmDirectory: string,
): Promise<Asset[]> {
	const promises: Array<Promise<void>> = [];
	const replace: Asset[] = [];

	for (const [index, paths] of Object.entries(assets)) {
		const isConflict = fix.assets.some(asset => asset.includes(paths[1]));

		if (isConflict) {
			logger.info(`Skipped conflict ${paths[1]}`);
		} else {
			const toCopy = join(modPath, 'assets', paths[0]);
			const toReplace = join(msmDirectory, 'data', paths[1]);
			const toReplaceSimplified = paths[1].substring(paths[1].lastIndexOf('/'));
			const tmpPath = join(appDirectory, 'tmp', toReplaceSimplified);
			const newBuffer = readFileSync(toCopy);

			if (existsSync(toReplace)) {
				logger.info(`Replacing ${toReplaceSimplified}`);
				promises.push(copyFile(toReplace, tmpPath));
			} else {
				logger.info(`Creating ${toReplaceSimplified}`);
				promises.push(createSubdirectoriesIfNotExist(toReplace));
			}

			promises.push(writeFile(toReplace, newBuffer));
			replace.push([toReplaceSimplified, paths[1]]);
		}
	}

	await Promise.all(promises);
	return replace;
}

async function handleMissingFile(
	msmFilePath: string,
	itemName: string,
): Promise<void> {
	logger.info(`Removing ${itemName}`);

	if (existsSync(msmFilePath)) {
		await unlink(msmFilePath);
	}

	await deleteEmptyDirectories(msmFilePath, itemName);
}

async function getMsmPath(): Promise<string | false> {
	const registryKeyPath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App 1419170';

	try {
		const {stdout} = await execAsync(`reg query "${registryKeyPath}" /v InstallLocation`);
		const match = /InstallLocation\s+REG_SZ\s+(.+)/.exec(stdout);
		const installLocation = match ? match[1] : '';
		return installLocation;
	} catch (error) {
		return false;
	}
}

function getErrorMessage(error: any): string {
	return error instanceof Error ? error.message : String(error);
}

async function fixGame(): Promise<void> {
	const tmpDirectory = join(appDirectory, 'tmp');
	const fixFilePath = join(tmpDirectory, 'fix.json');
	const msmDirectory = await getMsmPath();
	if (typeof (msmDirectory) === 'boolean') {
		return;
	}

	try {
		if (!existsSync(tmpDirectory)) {
			await mkdir(tmpDirectory);
		}

		if (!existsSync(fixFilePath)) {
			await writeFile(fixFilePath, '{"assets": ["hi","lol"]}');
		}

		const fixContents = await readJsonFile(fixFilePath) as Fix;
		const assets: Item[] = fixContents?.assets ?? [];

		await Promise.all(
			assets.map(async (items: Item) => {
				try {
					const filePath = join(tmpDirectory, items[0]);
					const msmFilePath = join(msmDirectory, 'data', items[1]);

					if (existsSync(filePath)) {
						logger.info(`Fixing ${items[1]}`);

						const newBuffer = await readFile(filePath);
						await writeFile(msmFilePath, newBuffer);
					} else {
						await handleMissingFile(msmFilePath, items[1]);
					}
				} catch (error) {
					logger.error(getErrorMessage(error));
				}
			}),
		);
	} catch (error) {
		logger.error(getErrorMessage(error));
	}
}

async function launchGame(): Promise<void> {
	const msmDirectory = await getMsmPath();
	try {
		if (
			!mainWindow
			|| msmDirectory === false
			|| !existsSync(msmDirectory)
		) {
			const errorMessage
			= msmDirectory === false
				? 'Couldn\'t find \'MySingingMonsters\' folder, please input the \'MySingingMonsters\' folder in the settings window'
				: 'The path to \'MySingingMonsters\' has changed.\nInput the \'MySingingMonsters\' path in the settings menu.';

			await showErrorDialog('Error', errorMessage);
			return;
		}

		logger.info('Killing MySingingMonsters.exe');
		await killProcess('MySingingMonsters.exe');

		logger.info('Launching MySingingMonsters.exe');
		await launchProcess(join(msmDirectory, 'MySingingMonsters.exe'));

		if (settings.closeAfterLaunch) {
			mainWindow?.close();
		}
	} catch (err) {
		logger.error(getErrorMessage(err));
	}
}

async function showErrorDialog(title: string, message: string): Promise<void> {
	if (mainWindow) {
		await dialog.showMessageBox(mainWindow, {
			title,
			message,
			buttons: ['OK'],
		});
	}
}

async function killProcess(processName: string): Promise<void> {
	return new Promise(resolve => {
		exec(`taskkill /IM "${processName}" /F`).on('exit', resolve);
	});
}

async function launchProcess(command: string): Promise<void> { // This hell to stop memory leakage
	let childProcess: ChildProcess | undefined;
	try {
		childProcess = spawn('cmd', ['/C', `"${command}"`], {shell: true, windowsHide: true, timeout: 10000});

		await new Promise<void>((resolve, reject) => {
			if (!childProcess) {
				reject(new Error('Failed to spawn child process'));
				return;
			}

			childProcess.on('exit', (code, signal) => {
				if (code === 0) {
					resolve();
				}
			});

			// Handle errors
			childProcess.on('error', err => {
				reject(new Error(`Error spawning process: ${err.message}`));
			});
		});
	} finally {
		setTimeout(async () => {
			if (childProcess?.pid !== undefined) {
				await killProcess(childProcess.pid.toString());
			}
		}, 1000);
	}
}

async function replaceAssets(names: string[]): Promise<void> {
	try {
		await fixGame();
		const {msmDirectory} = settings;
		const fixPath = join(appDirectory, 'tmp', 'fix.json');
		const promises: Array<Promise<void>> = [];

		await Promise.all(
			names.map(async name => {
				const modPath = join(msmDirectory, name);
				const {assets} = await readJsonFile(join(modPath, 'info.json')) as Fix;
				const fix = await readJsonFile(fixPath) as Fix;
				const replace: Asset[] = await processAssets(
					assets,
					fix,
					modPath,
					msmDirectory,
				);

				fix.assets = fix.assets.concat(replace);
				promises.push(writeFile(fixPath, JSON.stringify(fix)));
			}),
		);

		await Promise.all(promises);
	} catch (err) {
		logger.error(getErrorMessage(err));
	}
}

export {fixGame, replaceAssets, launchGame};
