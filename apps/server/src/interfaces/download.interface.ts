import {FfmpegCommand} from 'fluent-ffmpeg';

export interface DownloadedAudio {
    data: FfmpegCommand;
    filePath: string;
    title: string;
}
