import {
  catchError,
  from,
  mergeMap,
  Observable,
  switchMap,
  toArray,
} from 'rxjs';
import { getCachedVideo } from '../redis.service';
import ytdl, { videoInfo } from 'ytdl-core';
import { v4 as uuidv4 } from 'uuid';
import { PassThrough } from 'stream';
import createHttpError from 'http-errors';
import {
  DownloadedAudio,
  DownloadedVideo,
} from '../../interfaces/download.interface';
import { zipDownloadedContent } from '../archive.service';
import { getPlaylistItemsUrls } from './youtube.service';
import { createWriteStream } from 'fs';
import { mergeAudioWithVideo } from '../convertor.service';

// Define the function to download a single video
export function downloadSingleVideo(
  videoId: string,
  quality: string,
): Observable<DownloadedVideo> {
  // Return an observable
  return new Observable((subscriber) => {
    // Pipe the cached video info to process it further
    getCachedVideo(videoId)
      .pipe(
        mergeMap(async (info: videoInfo) => {
          // Choose the appropriate video and audio formats based on the provided quality
          const { downloadVideoFormat, downloadAudioFormat } = chooseDownloadFormat(
            info,
            quality,
          );
          // Set the file path to save the downloaded video
          const filePath = `${__dirname}/../../../public/${uuidv4()}.mp4`;
          // Get the title of the video
          const title = info.videoDetails.title;
          // Create a stream for the final output
          const result = new PassThrough({ highWaterMark: 100 || 1024 * 512 });
          // Create a stream for the video content
          const videoStream = ytdl.downloadFromInfo(info, {
            format: downloadVideoFormat,
          });
          // Create a stream for the audio content
          const audioStream = ytdl.downloadFromInfo(info, {
            format: downloadAudioFormat,
          });
          // Merge the audio and video streams into one
          mergeAudioWithVideo(audioStream, videoStream).pipe(result);
          // Save the merged stream to file
          const data = result.pipe(createWriteStream(filePath));
          // Send the downloaded video's data, file path, and title through the observable
          subscriber.next({ data, filePath, title });
          // Complete the observable
          subscriber.complete();
        }),
      )
      .subscribe();
  });
}

export function chooseDownloadFormat(
  info: videoInfo,
  quality: string,
): {
  downloadVideoFormat: ytdl.videoFormat;
  downloadAudioFormat: ytdl.videoFormat;
} {
  const { formats } = info;
  const videoFilter = (quality === 'high' && ['hd1080', 'hd720']) ||
    (quality === 'medium' && ['medium']) || ['small'];

  const downloadVideoFormat = formats.find(
    ({ quality:any, hasAudio }) => videoFilter.includes(quality) && !hasAudio,
  );

  const downloadAudioFormat = formats.find(({ hasVideo }) => !hasVideo);
  if (!downloadAudioFormat || !downloadVideoFormat) {
    throw new Error('This video does not has this quality');
  }
  return { downloadVideoFormat, downloadAudioFormat };
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
        mergeMap((videoId) => downloadSingleVideo(videoId, quality)),
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
