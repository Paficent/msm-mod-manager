import {type InstallExport, type DownloadInfo} from 'electron/types';
import {writeFile, mkdirSync, unlinkSync} from 'fs';
import {extname, join} from 'path';
import decompress from 'decompress';

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
				console.log(`Installing "${file._sDownloadUrl}"`);
				// eslint-disable-next-line no-await-in-loop
				await install(file._sDownloadUrl, installPath, info);
				break; // Assuming you want to install only the first matching file
			} else {
				console.error('File is not ".zip" or ".msm.mod"');
			}
		}
	} catch (error) {
		console.error('Error during installation:', error);
	}
}

async function install(downloadUrl: string, installPath: string, info: InstallExport) {
	try {
		const response = await fetch(downloadUrl);
		const data = await response.arrayBuffer();
		const tmpPath = join(appDirectory, 'tmp', `${installPath}.zip`);

		writeFile(tmpPath, Buffer.from(data), async () => {
			console.log(`Decompressing "${tmpPath}"`);
			await decompress(tmpPath, join(settings.msmDirectory, 'mods', installPath));
			unlinkSync(tmpPath);
			console.log(`Installed "${join(settings.msmDirectory, 'mods', installPath)}"`);
		});
	} catch (error) {
		console.error('Error during file download:', error);
	}
}

export {installMod};
