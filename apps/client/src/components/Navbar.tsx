import Link from "next/link";
import React from "react";
import {TbWorldDownload} from "react-icons/tb";

function Navbar() {
    return (
        <nav className="nav flex items-center justify-between w-full py-4 px-4 ">
            <div className="flex items-center space-x-3">
                <Link href={"/"}>
                    <TbWorldDownload className="text-red-700 text-4xl lg:text-7xl cursor-pointer"/>
                </Link>
                <h2 className="hidden md:text-2xl lg:text-3xl font-bold ">
                    Albume Downlaoder
                </h2>
            </div>
            <div className="flex items-center space-x-6">
                <Link href={"/about"}>
                    <h3 className="font-roboto_italic text-xl cursor-pointer  ">About</h3>
                </Link>
                <Link href={"/contact"}>
                    <h3 className="font-roboto_italic text-xl cursor-pointer  ">
                        Contact
                    </h3>
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;
