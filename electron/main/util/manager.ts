import {join, dirname, parse, sep, isAbsolute} from 'node:path';
import {existsSync, readFileSync} from 'node:fs';
import {writeFile, readFile, copyFile, unlink, mkdir, readdir} from 'node:fs/promises';
import {sync} from 'rimraf';

type Item = [string, string];
type Asset = [string, string];
type Fix = {assets: Asset[]};

async function createSubdirectoriesIfNotExist(dirPath: string) {
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

async function deleteEmptyDirectorys(filePath: string, originalPath: string) {
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
		console.log('Error checking/deleting parent directory');
	}
}

async function fixGame() {
	const tmpPath: string = join(appDirectory, '/tmp');
	const fixPath: string = join(tmpPath, 'fix.json');

	if (!existsSync(tmpPath)) {
		await mkdir(tmpPath);
	}

	if (!existsSync(fixPath)) {
		await writeFile(fixPath, '{"assets": ["hi","lol"]}');
	}

	const fixContents = JSON.parse((await readFile(fixPath)).toString()) as {assets: [[string, string]]};
	const assets: Item[] = fixContents.assets || [];

	if (assets) {
		assets.forEach((async (items: Item) => {
			try {
				console.log(items);
				const filePath = join(tmpPath, items[0]);
				const msmFilePath = join(settings.msmDirectory, 'data', items[1]);

				if (existsSync(filePath)) {
					console.log(`Fixing ${items[1]}`);

					const newBuffer = await readFile(filePath);
					await writeFile(msmFilePath, newBuffer);
				} else {
					try {
						console.log(`Removing ${items[1]}`);
						if (existsSync(msmFilePath)) {
							await unlink(msmFilePath);
						}

						await deleteEmptyDirectorys(msmFilePath, items[1]);
					} catch (deleteError) {
						if (deleteError instanceof Error) {
							console.log(
								`Error deleting file ${msmFilePath}: ${deleteError.message}`,
							);
						}
					}
				}
			} catch (writeError) {
				if (writeError instanceof Error) {
					console.log(writeError.message);
				}
			}
		}));
	}
}

async function replaceAssets(names: string[]) {
	try {
		await fixGame();
		const {msmDirectory} = settings;
		const fixPath = join(appDirectory, 'tmp', 'fix.json');
		const promises: Array<Promise<void>> = [];

		await Promise.all(names.map(async name => {
			const modPath = join(msmDirectory, name);
			const {assets} = JSON.parse((await readFile(join(modPath, 'info.toml'))).toString()) as {assets: Asset[]};
			let fix: Fix = {assets: []};

			if (existsSync(fixPath)) {
				fix = JSON.parse((await readFile(fixPath)).toString()) as Fix;
			}

			const replace: Asset[] = [];

			for (const [index, paths] of Object.entries(assets)) {
				const isConflict = fix.assets.some(asset => asset.includes(paths[1]));

				if (isConflict) {
					console.log(`Skipped conflict ${paths[1]}`);
				} else {
					const toCopy = join(modPath, 'assets/' + paths[0]);
					const toReplace = join(msmDirectory, 'data', paths[1]);
					const toReplaceSimplified = paths[1].substring(
						paths[1].lastIndexOf('/'),
					);
					const tmpPath = join(appDirectory, '/tmp', toReplaceSimplified);
					const newBuffer = readFileSync(toCopy);

					if (existsSync(toReplace)) {
						console.log(`Replacing ${toReplaceSimplified}`);

						promises.push(copyFile(toReplace, tmpPath));
						promises.push(writeFile(toReplace, newBuffer));

						replace.push([toReplaceSimplified, paths[1]]);
					} else {
						console.log(`Creating ${toReplaceSimplified}`);

						promises.push(createSubdirectoriesIfNotExist(toReplace));
						promises.push(writeFile(toReplace, newBuffer));

						replace.push([toReplaceSimplified, paths[1]]);
					}
				}
			}

			fix.assets = fix.assets.concat(replace);
			promises.push(writeFile(fixPath, JSON.stringify(fix)));
		}));

		await Promise.all(promises);
	} catch (err) {
		console.error(err);
	}
}

export {fixGame, replaceAssets};
