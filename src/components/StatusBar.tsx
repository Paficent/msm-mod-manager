import {VscDebugStart, VscRefresh} from 'react-icons/vsc';
import React, {type ReactElement} from 'react';
import { Tooltip } from '@material-tailwind/react';

export default function StatusBar(): ReactElement {
	const handleButtonClick = (event: React.MouseEvent, key: string): void => {
		event.preventDefault();
		void window.ipcRenderer.invoke(`click${key}`);
	};

	return (
		<div className='h-12 bg-neutral-900 border-t border-neutral-700 flex flex-row-reverse z-100 relative'>
			<div className='flex items-center -mr-2 text-neutral-200'>
				<Tooltip content='Refresh Mods'>
					<span
						className=' titlebar-button h-12 w-12 hover:bg-neutral-700 flex items-center justify-center'
						onClick={e => {
							handleButtonClick(e, 'Refresh');
						}}
					>
						<VscRefresh size={32} />
					</span>
				</Tooltip>
				<Tooltip content='Launch game'>
					<span
						className=' titlebar-button h-12 w-12 hover:bg-neutral-700 flex items-center justify-center'
						onClick={e => {
							handleButtonClick(e, 'Launch');
						}}
					>
						<VscDebugStart size={32} />
					</span>
				</Tooltip>
				<span className='h-0 w-2 flex items-center justify-center pointer-events-none'>
					<p className='text-transparent'> Don&apos;t Delete Me Yet This Is Pafi&apos;s Shitty Solution (DELETE EVENTUALLY)</p>
				</span>
			</div>
		</div>
	);
}
