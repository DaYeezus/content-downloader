import React from "react";
import { AiOutlineFileZip } from "react-icons/ai";
import { MdAudiotrack } from "react-icons/md";

function DownloadListItem() {
  return (
    <div className="relative w-full md:w-4/5 p-6 flex-col space-y-6 lg:space-y-0 lg:flex-row h-max rounded-lg my-3 bg-black z-20 flex items-start lg:items-center justify-between border-red-500 border outline-gray-900 outline">
        <div className={'absolute bg-[url(thumbnail link)] bg-center bg-contain  w-full h-full left-0 rounded-lg z-[-1] border-red-500 border opacity-40'}/>
      {/* name and size */}
      <div
        className={
          "flex flex-col items-start justify-center space-y-1.5 lg:space-y-3 z-20"
        }
      >
        <h3 className={"font-roboto_bold text-2xl"}>song or album name</h3>
        <h4 className={"text-base text-gray-300"}>Size Mb</h4>
      </div>
      {/* downlod options */}
      <div
        className={
          "flex flex-col items-center lg:items-end justify-center  w-full lg:w-max space-y-3 "
        }
      >
        <div className="flex items-center space-x-2 justify-center w-full">
          <button
            className={
              "w-max px-5 text-base font-roboto_bold py-3 rounded-xl border-red-500 border flex   items-center space-x-1.5 hover:scale-105 transition-all"
            }
          >
            <span>Zip</span> <AiOutlineFileZip />{" "}
          </button>
          <button
            className={
              "w-max px-5 text-base font-roboto_bold py-3 rounded-xl border-red-500 border flex   items-center space-x-1.5 hover:scale-105 transition-all"
            }
          >
            <span>mp3</span> <MdAudiotrack />{" "}
          </button>
        </div>
        <div className="flex items-center space-x-2 justify-center w-full">
          <span className={"text-base"}>high quality? </span>
          <input type="checkbox" className="toggle toggle-error" />
        </div>
      </div>
    </div>
  );
}

export default DownloadListItem;
