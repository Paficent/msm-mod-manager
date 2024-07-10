type HandlerExport = {
	channel: string;
	listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any;
};

type ModManagerSetting = {
	msmDirectory: string;
	debugMode: boolean;
	ignoreConflicts: boolean;
	disableUnsafeLuaFunctions: boolean;
	closeAfterLaunch: boolean;
	discordAutoJoin: boolean;
};

type InstallExport = {
	name: string;
	thumbnail: string;
	description: string;
	author: string;
	version: string;
	id: number;
};

type DownloadInfo = {
	_bIsTrashed: boolean;
	_bIsWithheld: boolean;
	_aFiles: [
		{
			_idRow: number;
			_sFile: string;
			_nFilesize: number;
			_sDescription: string;
			_tsDateAdded: number;
			_nDownloadCount: number;
			_sAnalysisState: string;
			_sDownloadUrl: string;
			_sMd5ChecksumL: string;
			_sClamAvResult: string;
			_sAnalysisResult: string;
			_bContainsExe: string;
			_bAcceptsDonations: string;
			_bShowRipePromo: string;
			_sLicense: string;
		},
	];
};

export type {HandlerExport, ModManagerSetting, InstallExport, DownloadInfo};
