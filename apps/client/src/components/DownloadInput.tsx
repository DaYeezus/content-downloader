import React, {useState} from "react";
import {BsSearch} from "react-icons/bs";

function DownloadInput() {
    const [link, setLink] = useState<string>("");
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
