import axios, { AxiosResponse } from 'axios';
import createHttpError, { BadRequest } from 'http-errors';
import {
  catchError,
  concatMap,
  defer,
  flatMap,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  switchMap,
  toArray,
} from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import ytdl, { videoInfo } from 'ytdl-core';
import { DownloadedAudio } from '../interfaces/download.interface';
import {
  youtubePlayList,
  youtubePlayListResponse,
} from '../interfaces/youtube-playlist.interface';
import { zipDownloadedAudios } from './archive.service';
import { convertStreamToSong } from './convertor.service';

import { getCachedVideo, getCachedYoutubePlaylistInfo } from './redis.service';

export function getYoutubeContentInfo(videoId: string): Observable<videoInfo> {
  process.env.YTDL_NO_UPDATE = 'true';

  return defer(() => ytdl.getInfo(videoId)).pipe(
    catchError((err) => {
      throw createHttpError(err);
    }),
  );
}

// This function downloads a single audio from a given videoId
export const downloadSingleAudio = (
  videoId: string,
  isHighQuality: boolean,
): Observable<DownloadedAudio> => {
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
      const filePath = `${__dirname}/../../public/${uuidv4()}.mp3`;

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
};

/**
 * Downloads audio files from a playlist and archives them into a zip file.
 *
 * @param {string} videoId - URL of the YouTube playlist.
 * @param {boolean} isHighQuality - Whether to download high quality audio or not.
 * @param {string} album_name - Name of the directory to be created and archived.
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
      downloadAllVideosFromPlaylist(videoIds, isHighQuality, handleErrors),
    ),
    mergeMap((downloadedAudios: DownloadedAudio[]) =>
      zipDownloadedAudios(downloadedAudios, isHighQuality, albumName).pipe(
        catchError(handleErrors('zipping downloaded audios')),
      ),
    ),
    catchError(handleErrors('getting playlist items URLs')),
  );
}
export function downloadAllVideosFromPlaylist(
  videoIds: string[],
  isHighQuality: boolean,
  handleErrors: Function,
): Observable<DownloadedAudio[]> {
  return from(videoIds).pipe(
    mergeMap((videoId) => downloadSingleAudio(videoId, isHighQuality)),
    toArray(),
    catchError(handleErrors('downloading audios')),
  );
}

//A function to get YouTube playlist information
//Returns an observable that emits the response of a GET request to the YouTube API
export function getYoutubePlaylistInfo(
  playlistId: string,
): Observable<AxiosResponse> {
  //Extract the playlist id from the link

  //Get the api key from environment variables
  const apiKey = process.env.YT_API_KEY;
  //The url to make the http GET request
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

  return from(axios.get(url)).pipe(
    map((response) => {
      if (
        (
          (response.data as youtubePlayListResponse)
            .items as youtubePlayList.Item[]
        ).length > 25
      ) {
        throw new BadRequest('Playlist can have 25 videos at most.');
      }
      return response;
    }),
  );
}

//A function to get URLs for all items in a YouTube playlist
export function getPlaylistItemsUrls(playlistId: string): Observable<string[]> {
  //Use the getYoutubePlaylistInfo function to get the playlist information, and switchMap allows us to chain another observable
  return getCachedYoutubePlaylistInfo(playlistId).pipe(
    switchMap((playlist) => {
      //Extract all video ids from each item in the playlist
      const itemIds = playlist.items.map(
        (item: youtubePlayList.Item) => item.snippet.resourceId.videoId,
      );
      //Transforms every video id into an observable for the cached video's url
      const videoUrlObservables = itemIds.map((itemId: string) =>
        getCachedVideo(itemId).pipe(
          map((value) => value.videoDetails.video_url),
          catchError((err) => {
            //Catch errors if any occur during transforming video ids to urls
            throw createHttpError(err);
          }),
        ),
      );
      /* Uses forkJoin to subscribe to all video urls, which only emits after all passed observables complete.
                  Then it returns transformed urls and filters out any empty ones */
      return forkJoin(videoUrlObservables).pipe(
        map((urls: string[]) => {
          return urls.filter((url: string) => url !== '');
        }),
        catchError((err) => {
          //Catch errors for any network failure or exceptions thrown by the underlying server-side library
          throw createHttpError(err);
        }),
      );
    }),
    catchError((err) => {
      //Catches any errors occurring while obtaining playlist information using the getYoutubePlaylistInfo function
      throw createHttpError(err);
    }),
  );
}
