import React from 'react';
import DownloadListItem from './DownloadListItem';

function DownloadList() {
  return (
    <div className="mt-7 w-3/4 flex flex-col items-center justify-center">
      <h5
        className="font-roboto_italic text-lg text-center
      "
      >
        Your Download list is currently empty
      </h5>
      <DownloadListItem />
    </div>
  );
}

export default DownloadList;
