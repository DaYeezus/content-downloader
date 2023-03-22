import Ffmpeg from 'fluent-ffmpeg';
import createHttpError from 'http-errors';
import {catchError, Observable, of, switchMap} from 'rxjs';
import internal, {Readable} from 'stream';
import {DownloadedAudio} from '../interfaces/download.interface';
import ffmpegPath from "ffmpeg-static";
import {spawn} from "child_process";

export function convertVideoToFlac$(
    stream: internal.Readable,
    filePath: string,
    artistName: string,
) {
    try {
        return of(
            Ffmpeg(stream)
                .toFormat('flac')
                .outputOptions('-metadata', `artist=${artistName}`)
                .audioCodec('flac')
                .audioFrequency(96000)
                .audioFilters('aformat=s32:sample_fmts=fltp:sample_rates=96000')
                .audioChannels(2)
                .audioBitrate(320)
                .save(filePath),
        );
    } catch (err: any) {
        throw createHttpError(err);
    }
}

export function convertVideoToMp3$(
    stream: internal.Readable,
    filePath: string,
    artistName: string,
) {
    try {
        return of(
            Ffmpeg(stream)
                .toFormat('mp3')
                .outputOptions('-metadata', `artist=${artistName}`)
                .audioCodec('libmp3lame')
                .audioFrequency(44100)
                .audioChannels(2)
                .audioBitrate(128)
                .save(filePath),
        );
    } catch (err: any) {
        throw createHttpError(err);
    }
}

/**
 * Converts a video stream to either high quality or low quality MP3 file based on whether isHighQuality parameter is true or false.
 *
 * @param {boolean} isHighQuality - Whether to convert to high quality or low quality.
 * @param {internal.Readable} stream - The video stream that needs to be converted.
 * @param {string} filePath - The location at which the converted audio file needs to be saved.
 * @param {string} channelName - The name of the channel that the song belongs to.
 * @param {string} title - The title of the song/video.
 *
 * @returns {Observable<{data, filePath, title}>} - An observable that returns an object with the data of the converted stream along with its file path and title details.
 */
export function convertStreamToSong(
    isHighQuality: boolean,
    stream: internal.Readable,
    filePath: string,
    channelName: string,
    title: string,
): Observable<DownloadedAudio> {
    const command$ = isHighQuality
        ? convertVideoToFlac$(stream, filePath, channelName)
        : convertVideoToMp3$(stream, filePath, channelName);

    // Return converted stream data along with file path and title
    return command$.pipe(
        switchMap((data) => {
            return of({
                data,
                filePath,
                title,
            });
        }),
        catchError((err) => {
            // Throw an HTTP error if something goes wrong
            throw createHttpError(err);
        }),
    );
}


export function mergeAudioWithVideo(audioStream: Readable, videoStream: Readable): Readable {
    if (!ffmpegPath) {
        throw new Error()
    }
    const ffmpegProcess = spawn(ffmpegPath, [
        // supress non-crucial messages
        '-loglevel', '8', '-hide_banner',
        // input audio and video by pipe
        '-i', 'pipe:3', '-i', 'pipe:4',
        // map audio and video correspondingly
        '-map', '0:a', '-map', '1:v',
        // no need to change the codec
        '-c', 'copy',
        // output mp4 and pipe
        '-f', 'matroska', 'pipe:5'
    ], {
        // no popup window for Windows users
        windowsHide: true,
        stdio: [
            // silence stdin/out, forward stderr,
            'inherit', 'inherit', 'inherit',
            // and pipe audio, video, output
            'pipe', 'pipe', 'pipe'
        ]
    });

    // @ts-ignore
    audioStream.pipe(ffmpegProcess.stdio[3]);
    // @ts-ignore
    videoStream.pipe(ffmpegProcess.stdio[4]);
    // @ts-ignore
    return ffmpegProcess.stdio[5]
}