"use client";

import { VscChromeMinimize, VscChromeClose, VscMenu } from "react-icons/vsc";
import { TbResize } from "react-icons/tb";

const buttons = ["File", "Mods", "Help"];

export default function TitleBar() {
  const handleButtonClick = (event: any, title: string) => {
    event.preventDefault();
    console.log(`Button "${title}" clicked!`);
  };

  return (
    <header className="titlebar">
      <div className="h-10 border-b border-neutral-700 bg-neutral-900 flex items-center px-2 justify-between">
        <img
          src={"../../../build/icon.ico"}
          width={20}
          height={20}
          alt=""
          className=""
        />

        {/* Links */}
        <div className="hidden sm:flex text-neutral-200 text-sm gap-2 px-4 mr-auto">
          {buttons.map((title) => (
            <button
              key={title}
              className="titlebar-button hover:bg-neutral-700  px-2 py-[0.2rem] rounded-md"
              onClick={(e) => handleButtonClick(e, title)}
            >
              {title}
            </button>
          ))}
        </div>
        {/* <span className="sm:flex mr-auto ml-4 text-neutral-200 cursor-pointer">
          <VscMenu size={18} />
        </span> */}

        {/* Title */}
        <p className="hidden md:block text-neutral-200 text-sm mr-auto">
          Pafi's Mod Manager
        </p>

        {/* Window Buttons */}
        <div className="flex items-center -mr-2 text-neutral-200">
          <span
            className="titlebar-button h-[2.4rem] w-10 hover:bg-neutral-700 flex items-center justify-center"
            onClick={(e) => handleButtonClick(e, "Minimize")}
          >
            <VscChromeMinimize />
          </span>
          <span
            className="titlebar-button h-[2.4rem] w-10 hover:bg-neutral-700 flex items-center justify-center"
            onClick={(e) => handleButtonClick(e, "Resize")}
          >
            <TbResize />
          </span>
          <span
            className="titlebar-button h-[2.4rem] w-10 hover:bg-red-500 flex items-center justify-center"
            onClick={(e) => handleButtonClick(e, "Close")}
          >
            <VscChromeClose />
          </span>
        </div>
      </div>
    </header>
  );
}
