import React, {useState} from 'react';
import {BsSearch} from 'react-icons/bs';

function DownloadInput() {
    const [link, setLink] = useState<string>('');
    const submitHandler = () => {
        const url = 'YOUR_YOUTUBE_URL_HERE'; // replace with your Youtube URL

        const videoRegex =
            /^(https?:\/\/)(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)$/;
        const playlistRegex1 =
            /^(https?:\/\/)(www\.)?(youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)$/;
        const playlistRegex2 =
            /^(https?:\/\/)(www\.)?(youtube\.com\/watch\?)(.*)?(list=)([a-zA-Z0-9_-]+)(&.*)?$/;

        let isPlaylist = false;

        if (videoRegex.test(url)) {
            console.log('This is a Youtube video!');
            isPlaylist = false;
        } else if (playlistRegex1.test(url) || playlistRegex2.test(url)) {
            console.log('This is a Youtube playlist!');
            isPlaylist = true;
        } else {
            throw new Error(
                'The provided URL is not a YouTube video nor a playlist!',
            );
        }
    };
    return (
        <div className="form-control w-[90%]">
            <div className="input-group ">
                <input
                    type="text"
                    placeholder="insert your link"
                    className="input input-bordered  w-full"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />
                <button className="btn btn-square text-2xl">
                    <BsSearch/>
                </button>
            </div>
        </div>
    );
}

export default DownloadInput;
