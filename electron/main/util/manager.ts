import {writeFile, readFile, copyFile, unlink, mkdir, readdir} from 'node:fs/promises';
import {join, dirname, parse, sep, isAbsolute} from 'node:path';
import {existsSync, readFileSync} from 'node:fs';
import {exec} from 'child_process';
import {dialog} from 'electron';
import {sync} from 'rimraf';

type Item = [string, string];
type Asset = [string, string];
type Fix = {assets: Asset[]};

async function createSubdirectoriesIfNotExist(dirPath: string): Promise<void> {
	const subdirectories = parse(dirPath).dir.split(sep);
	subdirectories.shift();

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

async function deleteEmptyDirectories(filePath: string, originalPath: string): Promise<void> {
	const parentDir = dirname(filePath);

	try {
		const files = await readdir(parentDir);

		if (files.length === 0) {
			console.log(
				`Removing ${originalPath.substring(0, originalPath.lastIndexOf('/'))}`,
			);
			sync(parentDir);
		}
	} catch (err) {
		console.error(getErrorMessage(err));
	}
}

async function readInfoFile(modPath: string): Promise<{assets: Asset[]}> {
	const infoFilePath = join(modPath, 'info.toml');
	const fileContent = await readFile(infoFilePath);
	return JSON.parse(fileContent.toString()) as {assets: Asset[]};
}

async function readFixFile(fixPath: string): Promise<Fix> {
	try {
		const fixContent = await readFile(fixPath);
		return JSON.parse(fixContent.toString()) as Fix;
	} catch (err) {
		return {assets: []};
	}
}

async function processAssets(assets: Asset[], fix: Fix, modPath: string, msmDirectory: string): Promise<Asset[]> {
	const promises: Array<Promise<void>> = [];
	const replace: Asset[] = [];

	for (const [index, paths] of Object.entries(assets)) {
		const isConflict = fix.assets.some(asset => asset.includes(paths[1]));

		if (isConflict) {
			console.log(`Skipped conflict ${paths[1]}`);
		} else {
			const toCopy = join(modPath, 'assets', paths[0]);
			const toReplace = join(msmDirectory, 'data', paths[1]);
			const toReplaceSimplified = paths[1].substring(paths[1].lastIndexOf('/'));
			const tmpPath = join(appDirectory, 'tmp', toReplaceSimplified);
			const newBuffer = readFileSync(toCopy);

			if (existsSync(toReplace)) {
				console.log(`Replacing ${toReplaceSimplified}`);
				promises.push(copyFile(toReplace, tmpPath));
			} else {
				console.log(`Creating ${toReplaceSimplified}`);
				promises.push(createSubdirectoriesIfNotExist(toReplace));
			}

			promises.push(writeFile(toReplace, newBuffer));
			replace.push([toReplaceSimplified, paths[1]]);
		}
	}

	await Promise.all(promises);
	return replace;
}

async function handleMissingFile(msmFilePath: string, itemName: string): Promise<void> {
	console.log(`Removing ${itemName}`);

	if (existsSync(msmFilePath)) {
		await unlink(msmFilePath);
	}

	await deleteEmptyDirectories(msmFilePath, itemName);
}

function getErrorMessage(error: any): string {
	return error instanceof Error ? error.message : String(error);
}

async function fixGame(): Promise<void> {
	const tmpDirectory = join(appDirectory, 'tmp');
	const fixFilePath = join(tmpDirectory, 'fix.json');

	try {
		if (!existsSync(tmpDirectory)) {
			await mkdir(tmpDirectory);
		}

		if (!existsSync(fixFilePath)) {
			await writeFile(fixFilePath, '{"assets": ["hi","lol"]}');
		}

		const fixContents = await readFixFile(fixFilePath);
		const assets: Item[] = fixContents.assets || [];

		await Promise.all(assets.map(async (items: Item) => {
			try {
				const filePath = join(tmpDirectory, items[0]);
				const msmFilePath = join(settings.msmDirectory, 'data', items[1]);

				if (existsSync(filePath)) {
					console.log(`Fixing ${items[1]}`);

					const newBuffer = await readFile(filePath);
					await writeFile(msmFilePath, newBuffer);
				} else {
					await handleMissingFile(msmFilePath, items[1]);
				}
			} catch (error) {
				console.error(getErrorMessage(error));
			}
		}));
	} catch (error) {
		console.error(getErrorMessage(error));
	}
}

async function launchGame(): Promise<void> {
	try {
		if (!mainWindow) {
			return;
		}

		if (settings.msmDirectory === '') {
			await showErrorDialog('Error', 'Couldn\'t find \'MySingingMonsters\' folder, please input the \'MySingingMonsters\' folder in the settings window');
			return;
		}

		if (!existsSync(settings.msmDirectory)) {
			await showErrorDialog('Error', 'The path to \'MySingingMonsters\' has changed.\nInput the \'MySingingMonsters\' path in the settings menu.');
			return;
		}

		console.log('Killing MySingingMonsters.exe');
		await killProcess('MySingingMonsters.exe');

		console.log('Launching MySingingMonsters.exe');
		await launchProcess(join(settings.msmDirectory, 'MySingingMonsters.exe'));

		if (settings.closeAfterLaunch) {
			mainWindow?.close();
		}
	} catch (err) {
		console.error(getErrorMessage(err));
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

async function launchProcess(command: string): Promise<void> {
	exec(`cmd /K "${command}"`);
}

async function replaceAssets(names: string[]): Promise<void> {
	try {
		await fixGame();
		const {msmDirectory} = settings;
		const fixPath = join(appDirectory, 'tmp', 'fix.json');
		const promises: Array<Promise<void>> = [];

		await Promise.all(names.map(async name => {
			const modPath = join(msmDirectory, name);
			const {assets} = await readInfoFile(modPath);
			const fix: Fix = await readFixFile(fixPath);
			const replace: Asset[] = await processAssets(assets, fix, modPath, msmDirectory);

			fix.assets = fix.assets.concat(replace);
			promises.push(writeFile(fixPath, JSON.stringify(fix)));
		}));

		await Promise.all(promises);
	} catch (err) {
		console.error(getErrorMessage(err));
	}
}

export {fixGame, replaceAssets, launchGame};
