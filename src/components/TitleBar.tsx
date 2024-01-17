import React, {type ReactElement} from 'react';

import {VscChromeMinimize, VscChromeClose} from 'react-icons/vsc';
import {TbResize} from 'react-icons/tb';

const buttons = ['File', 'Mods', 'Help'];

export default function TitleBar(): ReactElement {
	const handleWindowButtonClick = (event: React.MouseEvent, key: string): void => {
		event.preventDefault();
		void window.ipcRenderer.invoke(`click${key}`);
	};

	return (
		<header className='titlebar'>
			<div className='h-10 border-b border-neutral-700 bg-neutral-900 flex items-center px-2 justify-between'>
				<img
					src={'../../../build/icon.ico'}
					width={20}
					height={20}
					alt=''
					className=''
				/>

				{/* Links */}
				<div className='hidden sm:flex text-neutral-200 text-sm gap-2 px-4 mr-auto'>
					{buttons.map(title => (
						<button
							key={title}
							className='titlebar-button hover:bg-neutral-700  px-2 py-[0.2rem] rounded-md'
							onClick={e => {
								console.log(e, title);
							}}
						>
							{title}
						</button>
					))}
				</div>

				{/* Title */}
				<p className='hidden md:block text-neutral-200 text-sm mr-auto'>
                Pafi&apos;s Mod Manager
				</p>

				{/* Window Buttons */}
				<div className='flex items-center -mr-2 text-neutral-200'>
					<span
						className='titlebar-button h-[2.4rem] w-10 hover:bg-neutral-700 flex items-center justify-center'
						onClick={e => {
							handleWindowButtonClick(e, 'Minimize');
						}}
					>
						<VscChromeMinimize />
					</span>
					<span
						className='titlebar-button h-[2.4rem] w-10 hover:bg-neutral-700 flex items-center justify-center'
						onClick={e => {
							handleWindowButtonClick(e, 'Resize');
						}}
					>
						<TbResize />
					</span>
					<span
						className='titlebar-button h-[2.4rem] w-10 hover:bg-red-500 flex items-center justify-center'
						onClick={e => {
							handleWindowButtonClick(e, 'Close');
						}}
					>
						<VscChromeClose />
					</span>
				</div>
			</div>
		</header>
	);
}
