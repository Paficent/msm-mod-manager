import {type InstallExport, type DownloadInfo} from 'electron/types';
import {writeFile, mkdirSync, unlinkSync} from 'fs';
import {extname, join} from 'path';
import decompress from 'decompress';
import logger from './logger';

async function installMod(installPath: string, info: InstallExport) {
	try {
		const response = await fetch(`https://gamebanana.com/apiv11/Mod/${info.id}/DownloadPage`);
		const data = (await response.json()) as DownloadInfo;
		const files = data._aFiles;

		const tmpDir = join(appDirectory, 'tmp');
		mkdirSync(tmpDir, {recursive: true});

		for (const file of files) {
			const extName = extname(file._sFile);
			if (extName === '.zip' || extName === '.mod') {
				logger.info(`Installing "${file._sDownloadUrl}"`);
				// eslint-disable-next-line no-await-in-loop
				await install(file._sDownloadUrl, installPath, info);
				break; // Assuming you want to install only the first matching file
			} else {
				logger.error('File is not ".zip" or ".msm.mod"');
			}
		}
	} catch (error) {
		const typedError = error as Error;
		logger.error(`Error during installation: "${typedError.message}"`);
	}
}

async function install(downloadUrl: string, installPath: string, info: InstallExport) {
	try {
		const response = await fetch(downloadUrl);
		const data = await response.arrayBuffer();
		const tmpPath = join(appDirectory, 'tmp', `${installPath}.zip`);

		writeFile(tmpPath, Buffer.from(data), async () => {
			logger.info(`Decompressing "${tmpPath}"`);
			await decompress(tmpPath, join(settings.msmDirectory, 'mods', installPath));
			unlinkSync(tmpPath);
			logger.info(`Installed "${join(settings.msmDirectory, 'mods', installPath)}"`);
		});
	} catch (error) {
		const typedError = error as Error;
		logger.error(`Error during file download: ${typedError.message}`);
	}
}

export {installMod};
