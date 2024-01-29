'use client';
import React, {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
	VscHome,
	VscGlobe,
	VscDebugConsole,
	VscInfo,
	VscTools,
	VscSettingsGear,
} from 'react-icons/vsc';

export default function SideBar() {
	const [activeTab, setActiveTab] = useState(0);

	const inActiveTabStyle
= 'text-neutral-400 border-l-2 border-transparent cursor-pointer h-16 flex items-center justify-center w-full';
	const activeTabStyle
= 'text-neutral-200 border-l-2 border-blue-400 cursor-pointer h-16 flex items-center justify-center w-full';
	return (
		<div className='w-fit h-full bg-neutral-900 flex'>
			<div className='w-14 h-full border-r border-neutral-700 flex flex-col'>
				<Link to='/' className={activeTab === 0 ? activeTabStyle : inActiveTabStyle} onClick={() => {
					setActiveTab(0);
				}}>
					<VscHome size={32} />
				</Link>
				<Link to='/web' className={activeTab === 1 ? activeTabStyle : inActiveTabStyle} onClick={() => {
					setActiveTab(1);
				}}>
					<VscGlobe size={32} />
				</Link>
				<Link to='/tools' className={activeTab === 2 ? activeTabStyle : inActiveTabStyle} onClick={() => {
					setActiveTab(2);
				}}>
					<VscTools size={32} />
				</Link>
				<Link to='/console' className={activeTab === 3 ? activeTabStyle : inActiveTabStyle} onClick={() => {
					setActiveTab(3);
				}}>
					<VscDebugConsole size={32} />
				</Link>

				<Link to='/info' className={`${
					activeTab === 4 ? activeTabStyle : inActiveTabStyle
				} mt-auto`} onClick={() => {
					setActiveTab(4);
				}}>
					<VscInfo size={32} />
				</Link>

				<Link to='/settings' className={activeTab === 5 ? activeTabStyle : inActiveTabStyle} onClick={() => {
					setActiveTab(5);
				}}>
					<VscSettingsGear size={32} />
				</Link>
			</div>
		</div>
	);
}
