// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
	type ProcessEnv = {
		AppData: string;
		VITE_DEV_SERVER_URL: string | undefined;
		DIR_NAME: string;
		VSCODE_DEBUG?: 'true';
		DIST_ELECTRON: string;
		DIST: string;
		/** /dist/ or /public/ */
		VITE_PUBLIC: string;
	};
}
