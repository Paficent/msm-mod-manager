/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />

interface Window {
	ipcRenderer: import('electron').IpcRenderer;
}
