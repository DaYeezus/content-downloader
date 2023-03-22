import {FfmpegCommand} from 'fluent-ffmpeg';
import {WriteStream} from "fs";


export interface DownloadedAudio {
    data: FfmpegCommand;
    filePath: string;
    title: string;
}
export interface DownloadedVideo {
    data:WriteStream,
    filePath: string;
    title: string;
}
