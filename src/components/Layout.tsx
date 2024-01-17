import React, {type ReactElement} from 'react';

import SideBar from './SideBar';
import StatusBar from './StatusBar';
import TitleBar from './TitleBar';

export default function Layout({children}: {children: React.ReactNode}): ReactElement {
	return (
		<main className='select-none'>
			<TitleBar />
			<div className='h-[calc(100dvh-5.5rem)] flex'>
				<SideBar />
				<div className='w-full h-full bg-neutral-800'>{children}</div>
			</div>
			<StatusBar />
		</main>
	);
}
