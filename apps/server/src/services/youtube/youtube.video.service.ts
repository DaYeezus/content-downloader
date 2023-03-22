import {catchError, from, mergeMap, Observable, switchMap, toArray} from "rxjs";
import {getCachedVideo} from "../redis.service";
import ytdl, {videoInfo} from "ytdl-core";
import {v4 as uuidv4} from "uuid";
import {PassThrough} from "stream";
import createHttpError from "http-errors";
import {DownloadedAudio, DownloadedVideo} from "../../interfaces/download.interface";
import {zipDownloadedContent} from "../archive.service";
import {getPlaylistItemsUrls} from "./youtube.service";
import {downloadSingleAudio} from "./youtube.audio.service";
import {createWriteStream} from "fs";
import {mergeAudioWithVideo} from "../convertor.service";

export function downloadSingleVideo(
    videoId: string,
    quality: string,
): Observable<DownloadedVideo> {
    return new Observable((subscriber) => {
        getCachedVideo(videoId)
            .pipe(
                mergeMap(async (info: videoInfo) => {
                    const {downloadVideoFormat, downloadAudioFormat} = chooseFormat(info, quality)
                    const filePath = `${__dirname}/../../../public/${uuidv4()}.mp4`;
                    const title = info.videoDetails.title;
                    const result = new PassThrough({highWaterMark: 100 || 1024 * 512});
                    const videoStream = ytdl
                        .downloadFromInfo(info, {
                            format: downloadVideoFormat,
                        })
                    const audioStream = ytdl
                        .downloadFromInfo(info, {
                            format: downloadAudioFormat,
                        })
                    mergeAudioWithVideo(audioStream, videoStream).pipe(result)
                    const data = result.pipe(createWriteStream(filePath))
                    subscriber.next({data,filePath,title})
                    subscriber.complete()
                }),
            )
            .subscribe();
    });
}


function chooseFormat(info: videoInfo, quality: string) {
    const videoFormats = info.formats;
    const downloadVideoFormat =
        quality === 'high'
            ? videoFormats.find(
                (fo) =>
                    (fo.quality === 'hd1080' || fo.quality === 'hd720') &&
                    !fo.hasAudio,
            )
            : quality === 'medium'
                ? videoFormats.find(
                    (fo) => fo.quality === 'medium' && !fo.hasAudio,
                )
                : videoFormats.find(
                    (fo) => fo.quality === 'small' && !fo.hasAudio,
                );
    const downloadAudioFormat = videoFormats.find((fo) => !fo.hasVideo);
    return {downloadVideoFormat, downloadAudioFormat}
}

/**
 * Downloads video files from a playlist and archives them into a zip file.
 *
 * @param playlistId
 * @param quality
 * @param albumName
 * @returns {Observable<string>} - Observable that emits the path of the zip file when complete.
 */
export function downloadVideoFromPlaylist(
    playlistId: string,
    quality: string,
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
                mergeMap((videoId) => downloadSingleVideo(videoId,quality)),
                toArray(),
                catchError(handleErrors('downloading audios')),
            ),
        ),
        mergeMap((downloadedVideos: DownloadedVideo[]) =>
            zipDownloadedContent(downloadedVideos, quality, albumName).pipe(
                catchError(handleErrors('zipping downloaded audios')),
            ),
        ),
        catchError(handleErrors('getting playlist items URLs')),
    );
}