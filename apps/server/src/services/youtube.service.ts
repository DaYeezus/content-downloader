import axios, { AxiosResponse } from 'axios';
import { FfmpegCommand } from 'fluent-ffmpeg';
import { HttpError } from 'http-errors';
import path from 'path';
import { catchError, from, map, mergeMap, Observable } from 'rxjs';
import ytdl, { videoInfo } from 'ytdl-core';
import { youtubePlayList } from '../interfaces/youtube-playlist.interface';
import { convertVideoToFlac, convertVideoToMp3 } from './convertor.service';
import { getCachedVideo } from './redis.service';
export function getYoutubeContentInfo(link: string): Observable<videoInfo> {
  process.env.YTDL_NO_UPDATE = 'true';
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
  return getCachedVideo(link).pipe(
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

      return (
        isHightQUality
          ? convertVideoToFlac(
              stream,
              filePath,
              info.videoDetails.ownerChannelName,
            )
          : convertVideoToMp3(
              stream,
              filePath,
              info.videoDetails.ownerChannelName,
            )
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

export function getPlaylistItemsId(link: string): Observable<string[]> {
  return getPlaylistInfo(link).pipe(
    map((playlist) => {
      const videoIds: string[] = [];

      (playlist.data.items as youtubePlayList.Item[]).forEach(
        (item: youtubePlayList.Item) => {
          videoIds.push(item.snippet.resourceId.videoId);
        },
      );
      return videoIds;
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
