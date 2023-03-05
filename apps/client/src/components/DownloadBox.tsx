import React from 'react';
import DownloadInput from './DownloadInput';
import DownloadList from './DownloadList';

function DownloadBox() {
    return (
        <div
            className="bg-black backdrop-blur-xl backdrop-brightness-125  border-none rounded-lg h-max py-4 px-3 flex flex-col items-center justify-center">
            <DownloadInput/>
            <DownloadList/>
        </div>
    );
}

export default DownloadBox;
