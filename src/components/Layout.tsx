import React, {type ReactElement} from 'react';

import SideBar from './SideBar';
import StatusBar from './StatusBar';
import TitleBar from './TitleBar';

export default function Layout({children}: {children: React.ReactNode}): ReactElement {
	return (
		<main className='select-none'>
			<div className='z-100'>
				<TitleBar />
			</div>
			<div className='h-[calc(100dvh-5.5rem)] flex'>
				<SideBar/>
				<div className='w-full bg-neutral-800 z-0 text-neutral-200'>{children}</div>
			</div>
			<div className='z-100'>
				<StatusBar/>
			</div>
		</main>
	);
}
