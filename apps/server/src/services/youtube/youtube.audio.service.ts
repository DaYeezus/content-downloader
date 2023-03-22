import {catchError, from, mergeMap, Observable, switchMap, toArray} from "rxjs";
import createHttpError from "http-errors";
import {DownloadedAudio} from "../../interfaces/download.interface";
import {zipDownloadedContent} from "../archive.service";
import {getPlaylistItemsUrls} from "./youtube.service";
import {getCachedVideo} from "../redis.service";
import ytdl from "ytdl-core";
import {v4 as uuidv4} from "uuid";
import {convertStreamToSong} from "../convertor.service";

/**
 * Downloads audio files from a playlist and archives them into a zip file.
 *
 * @param playlistId
 * @param {boolean} isHighQuality - Whether to download high quality audio or not.
 * @param albumName
 * @returns {Observable<string>} - Observable that emits the path of the zip file when complete.
 */
export function downloadAudioFromPlaylist(
    playlistId: string,
    isHighQuality: boolean,
    albumName: string,
): Observable<string> {
    /**
     * Extracted function for generic error handling.
     */
    const handleErrors = (step: string) => (err: any) => {
        console.error(`Error occurred while ${step}: ${err}`);
        throw createHttpError(err);
    };

    return getPlaylistItemsUrls(playlistId).pipe(
        switchMap((videoIds) =>
            from(videoIds).pipe(
                mergeMap((videoId) => downloadSingleAudio(videoId, isHighQuality)),
                toArray(),
                catchError(handleErrors('downloading audios')),
            ),
        ),
        mergeMap((downloadedAudios: DownloadedAudio[]) =>
            zipDownloadedContent(downloadedAudios, isHighQuality, albumName).pipe(
                catchError(handleErrors('zipping downloaded audios')),
            ),
        ),
        catchError(handleErrors('getting playlist items URLs')),
    );
}

// This function downloads a single audio from a given videoId
export function downloadSingleAudio(
    videoId: string,
    isHighQuality: boolean,
): Observable<DownloadedAudio> {
    // Select video quality based on isHighQuality value
    const quality = isHighQuality ? 'highestaudio' : 'lowestaudio';

    return getCachedVideo(videoId).pipe(
        // Switch to inner observable to handle downloading and converting
        switchMap((info) => {
            // Download the audio stream using ytdl library

            const stream = ytdl.downloadFromInfo(info, {
                filter: 'audioonly',
                quality,
            });

            // Generate unique file path based on selected format
            const filePath = `${__dirname}/../../public/${uuidv4()}.${
                isHighQuality ? 'flac' : 'mp3'
            }`;

            // Save video title and channel name for later use
            const title = info.videoDetails.title;
            const channelName = info.videoDetails.ownerChannelName;

            // Convert downloaded video stream to either FLAC or MP3 format
            return convertStreamToSong(
                isHighQuality,
                stream,
                filePath,
                channelName,
                title,
            );
        }),
        catchError((err) => {
            throw createHttpError(err);
        }),
    );
}