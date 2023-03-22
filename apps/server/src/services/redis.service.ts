import createHttpError from 'http-errors';
import {catchError, from, map, Observable, of, switchMap, tap} from 'rxjs';
import {videoInfo} from 'ytdl-core';
import {redisClient} from '../conf/redis.conf';
import {getPlaylistItemsUrls, getYoutubeContentInfo, getYoutubePlaylistInfo,} from './youtube/youtube.service';
import {youtubePlayListResponse} from '../interfaces/youtube-playlist.interface';

// both of below functions look for cached data with the content link as key and return it of it was available
// and fetch data from original functions and set into redis of there was no cached data

export function getCachedVideo(videoId: string): Observable<videoInfo> {
    const cachedVideo$ = from(redisClient.get(videoId));

    return cachedVideo$.pipe(
        switchMap((result) => {
            if (!result) {
                const videoInfo$ = getYoutubeContentInfo(videoId).pipe(
                    tap((data) =>
                        redisClient.set(videoId, JSON.stringify(data), {EX: 3600}),
                    ), // cache for 60 minutes
                    catchError((error) => {
                        console.error(error);
                        throw createHttpError(error);
                    }),
                );

                return videoInfo$;
            }

            return of(JSON.parse(String(result)));
        }),
        catchError((error) => {
            console.error(error);
            throw createHttpError(error);
        }),
    );
}

export function getCachedPlaylistVideos(
    playlistId: string,
): Observable<string[]> {
    const cachedPlaylist$ = from(redisClient.get(playlistId));

    return cachedPlaylist$.pipe(
        switchMap((result) => {
            if (!result) {
                const playlistItemsUrls$ = getPlaylistItemsUrls(playlistId).pipe(
                    tap(
                        (data) =>
                            redisClient.set(playlistId, JSON.stringify(data), {EX: 3600}), // cache for 60 minutes
                    ),
                    catchError((error) => {
                        console.error(error);
                        throw createHttpError(error);
                    }),
                );

                return playlistItemsUrls$;
            }

            return of(JSON.parse(String(result)));
        }),
        catchError((error) => {
            console.error(error);
            throw createHttpError(error);
        }),
    );
}

export function getCachedYoutubePlaylistInfo(
    playlistId: string,
): Observable<youtubePlayListResponse> {
    return from(redisClient.get(playlistId)).pipe(
        switchMap((result) =>
            !result
                ? getYoutubePlaylistInfo(playlistId).pipe(
                    tap((response) =>
                        redisClient.set(playlistId, JSON.stringify(response.data), {
                            EX: 3600,
                        }),
                    ),
                    map((response) => response.data),
                    catchError((error) => {
                        console.error(error);
                        throw createHttpError(error);
                    }),
                )
                : of(JSON.parse(String(result))),
        ),
        catchError((error) => {
            console.error(error);
            throw createHttpError(error);
        }),
    );
}
