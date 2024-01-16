"use client";

import { useState } from "react";
import {
  VscHome,
  VscGlobe,
  VscDebugConsole,
  VscInfo,
  VscTools,
  VscSettingsGear,
} from "react-icons/vsc";

export default function SideBar() {
  const [activeTab, setActiveTab] = useState(0);
  const inActiveTabStyle =
    "text-neutral-400 border-l-2 border-transparent cursor-pointer h-16 flex items-center justify-center w-full";
  const activeTabStyle =
    "text-neutral-200 border-l-2 border-blue-400 cursor-pointer h-16 flex items-center justify-center w-full";
  return (
    <div className="w-fit h-full bg-neutral-900 flex">
      <div className="w-14 h-full border-r border-neutral-700 flex flex-col">
        <span
          className={activeTab === 0 ? activeTabStyle : inActiveTabStyle}
          onClick={() => {
            setActiveTab(0);
          }}
        >
          <VscHome size={32} />
        </span>
        <span
          className={activeTab === 1 ? activeTabStyle : inActiveTabStyle}
          onClick={() => setActiveTab(1)}
        >
          <VscGlobe size={32} />
        </span>
        <span
          className={activeTab === 2 ? activeTabStyle : inActiveTabStyle}
          onClick={() => setActiveTab(2)}
        >
          <VscTools size={32} />
        </span>
        <span
          className={activeTab === 3 ? activeTabStyle : inActiveTabStyle}
          onClick={() => setActiveTab(3)}
        >
          <VscDebugConsole size={32} />
        </span>

        <span
          className={`${
            activeTab === 5 ? activeTabStyle : inActiveTabStyle
          } mt-auto`}
          onClick={() => setActiveTab(5)}
        >
          <VscInfo size={32} />
        </span>
        <span
          className={activeTab === 6 ? activeTabStyle : inActiveTabStyle}
          onClick={() => setActiveTab(6)}
        >
          <VscSettingsGear size={32} />
        </span>
      </div>
    </div>
  );
}
