import axios, { AxiosResponse } from 'axios';
import Ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { catchError, from, map, mergeMap, Observable, of } from 'rxjs';
import ytdl, { videoInfo } from 'ytdl-core';
import { HttpError } from 'http-errors';
import { getCachedData } from './redis.service';
import path from 'path';
export interface FetchedVideoInfo {
  title: string;
  image: ytdl.thumbnail;
  url: string;
}
export function getYoutubeContentInfo(link: string): Observable<videoInfo> {
  return from(ytdl.getInfo(link)).pipe(
    map((data: videoInfo) => {
      return data;
    }),
    catchError((err) => {
      throw new HttpError(err);
    }),
  );
}

export function downloadSingleAudio(link: string, isHightQUality = true) {
  return getCachedData(link).pipe(
    mergeMap((info: videoInfo) => {
      const stream = ytdl.downloadFromInfo(info, {
        filter: 'audioonly',
        quality: isHightQUality ? 'highestaudio' : 'lowestaudio',
      });
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'public',
        `${Math.floor(Math.random() * 1000000)}.mp3`,
      );

      return of(
        Ffmpeg(stream)
          .audioBitrate(isHightQUality ? 320 : 128)
          .toFormat(isHightQUality ? 'flac' : 'mp3')
          .outputOptions(
            '-metadata',
            `artist=${info.videoDetails.ownerChannelName}`,
            '-codec:a libmp3lame',
            '-b:a 320k', 
          )
          .save(filePath),
      ).pipe(
        map((data: FfmpegCommand) => {
          return { data, filePath, title: info.videoDetails.title };
        }),
        catchError((err) => {
          console.log(err);
          throw new HttpError(err);
        }),
      );
    }),
  );
}

export function downloadAudioFromPlaylist(
  link: string,
  isHightQUality: boolean,
  format: string,
) {}

export function getPlaylistInfo(link: string): Observable<AxiosResponse> {
  const playlistId = getPlaylistId(link);
  const apiKey = process.env.YT_API_KEY;
  return from(
    axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`,
    ),
  ).pipe(
    map((response) => {
      return response;
    }),
    catchError((err) => {
      throw new HttpError(err);
    }),
  );
}

export function getPlaylistItemsId(
  link: string,
): Observable<{ playListVideos: string[]; playlistTitle: string }> {
  return getPlaylistInfo(link).pipe(
    map((playlist) => {
      const videoIds: string[] = [];

      playlist.data.items.forEach((item: any) => {
        videoIds.push(item.snippet.resourceId.videoId);
      });
      return { playListVideos: videoIds, playlistTitle: playlist.data };
    }),
    catchError((err) => {
      throw new HttpError(err);
    }),
  );
}

function getPlaylistId(url: string): string {
  const regex = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
  const match = url.match(regex);

  if (match && match[2]) {
    return match[2];
  } else {
    throw new HttpError('Invalid YouTube playlist URL');
  }
}
