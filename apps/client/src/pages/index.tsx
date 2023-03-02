import {Inter} from "next/font/google";
import Navbar from "@/components/Navbar";
import DownloadBox from "@/components/DownloadBox";
import Hero from "@/components/Hero";

const inter = Inter({subsets: ["latin"]});

export default function Home() {
    return (
        <div className="flex items-center flex-col">
            <Navbar/>
            <main className="w-full my-20 px-5 md:px-24 lg:px-44">
                <Hero/>
                <DownloadBox/>
            </main>
        </div>
    );
}
