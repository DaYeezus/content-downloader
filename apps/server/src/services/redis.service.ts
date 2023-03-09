import { from, Observable, of, switchMap, tap } from 'rxjs';
import { videoInfo } from 'ytdl-core';
import { redisClient } from '../conf/redis.conf';
import { getPlaylistItemsUrls, getYoutubeContentInfo } from './youtube.service';

// both of below functions look for cached data with the content link as key and return it of it was available
// and fetch data from original functions and set into redis of there was no cached data

export function getCachedVideo(link: string): Observable<videoInfo> {
  const cachedVideo$ = from(redisClient.get(link));

  return cachedVideo$.pipe(
    switchMap((result) => {
      if (!result) {
        const videoInfo$ = getYoutubeContentInfo(link).pipe(
          tap((data) =>
            redisClient.set(link, JSON.stringify(data), { EX: 3600 }),
          ), // cache for 60 minutes
        );

        return videoInfo$;
      }

      return of(JSON.parse(String(result)));
    }),
  );
}

export function getCachedPlaylistVideos(link: string): Observable<string[]> {
  const cachedPlaylist$ = from(redisClient.get(link));

  return cachedPlaylist$.pipe(
    switchMap((result) => {
      if (!result) {
        const playlistItemsUrls$ = getPlaylistItemsUrls(link).pipe(
          tap(
            (data) => redisClient.set(link, JSON.stringify(data), { EX: 3600 }), // cache for 60 minutes
          ),
        );

        return playlistItemsUrls$;
      }

      return of(JSON.parse(String(result)));
    }),
  );
}
