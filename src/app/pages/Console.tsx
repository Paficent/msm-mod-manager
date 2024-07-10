import {Typography} from '@material-tailwind/react';
import React, {useState, useEffect} from 'react';

const Console = () => {
	const [mounted, setMounted] = useState(false);
	const [items, setItems] = useState([
		{
			data: 'Started Console Redirection Service v0.0.1',
			color: 'text-neutral-400',
		},
	]);

	useEffect(() => {
		let toConsoleHandler: (event: Electron.IpcRendererEvent, ...args: any[]) => void;

		if (!mounted) {
			toConsoleHandler = (event, ...args) => {
				console.log('Received event:', args);
				setItems(prevData => prevData.concat(args));
			};

			console.log('Console component mounted');

			window.ipcRenderer.on('toConsole', toConsoleHandler);

			setMounted(true);
		}

		return () => {
			console.log('Console component unmounted');
			if (toConsoleHandler) {
				window.ipcRenderer.removeListener('toConsole', toConsoleHandler);
			}
		};
	}, [mounted]);

	console.log('Console component rendered');

	return (
		<div className='h-full w-full overflow-hidden'>
			<div className='h-full overflow-y-scroll overflow-x-hidden'>
				{items.map((item, index) => (
					<Typography
						placeholder=''
						key={index}
						variant='small'
						className={item.color}
					>
						{index === items.length - 1 && `> ${item.data}`}
						{index !== items.length - 1 && item.data}
					</Typography>
				))}
			</div>
		</div>
	);
};

export default Console;
