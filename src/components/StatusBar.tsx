import { VscDebugStart, VscRefresh } from "react-icons/vsc";

export default function StatusBar() {
  const handleButtonClick = (event: React.MouseEvent, key: string) => {
    event.preventDefault();
    window.ipcRenderer.invoke(`click_${key}`);
  };

  return (
    <div className="h-12 bg-neutral-900 border-t border-neutral-700 flex flex-row-reverse">
      <div className="flex items-center -mr-2 text-neutral-200">
        <span
          key="refresh"
          className=" titlebar-button h-12 w-12 hover:bg-neutral-700 flex items-center justify-center"
          onClick={(e) => handleButtonClick(e, "refresh")}
        >
          <VscRefresh size={32} />
        </span>
        <span
          className=" titlebar-button h-12 w-12 hover:bg-neutral-700 flex items-center justify-center"
          onClick={(e) => handleButtonClick(e, "launch")}
        >
          <VscDebugStart size={32} />
        </span>
        <span className="h-0 w-2 flex items-center justify-center pointer-events-none">
          <p className="text-transparent">
            Don't Delete Me Yet This Is Pafi's Shitty Solution (DELETE
            EVENTUALLY)
          </p>
        </span>
      </div>
    </div>
  );
}
