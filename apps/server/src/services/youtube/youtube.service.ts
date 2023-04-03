import axios, { AxiosResponse } from 'axios';
import createHttpError, { BadRequest } from 'http-errors';
import {
  catchError,
  defer,
  forkJoin,
  from,
  map,
  Observable,
  switchMap,
} from 'rxjs';
import ytdl, { videoInfo } from 'ytdl-core';
import {
  youtubePlayList,
  youtubePlayListResponse,
} from '../../interfaces/youtube-playlist.interface';

import { getCachedVideo, getCachedYoutubePlaylistInfo } from '../redis.service';

export function getYoutubeContentInfo(videoId: string): Observable<videoInfo> {
  process.env.YTDL_NO_UPDATE = 'true';

  return defer(() => ytdl.getInfo(videoId)).pipe(
    catchError((err) => {
      throw createHttpError(err);
    }),
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
        ).length > 50
      ) {
        throw new BadRequest('Playlist can have 50 videos at most.');
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
