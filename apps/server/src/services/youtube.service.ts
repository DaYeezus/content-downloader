import axios, { AxiosResponse } from 'axios';
import Ffmpeg from 'fluent-ffmpeg';
import { from, Observable, of, map, mergeMap, catchError } from 'rxjs';
import ytdl, { videoInfo } from 'ytdl-core';

export function getYoutubeContentInfo(link: string): Observable<videoInfo> {
  return from(ytdl.getInfo(link));
}

export function downloadSingleAudio(
  link: string,
  isHightQUality = true,
  filePath: string,
): Observable<any> {
  const stream = ytdl(link, {
    filter: 'audioonly',
    quality: isHightQUality ? 'highestaudio' : 'lowestaudio',
  });

  return of(
    Ffmpeg(stream)
      .audioBitrate(isHightQUality ? 320 : 128)
      .toFormat(isHightQUality ? 'flac' : 'mp3')
      .save(filePath),
  );
}

export function downloadAudioFromPlaylist(
  link: string,
  isHightQUality: boolean,
  format: string,
) {
  //   await getPlaylistItemsId(link);
  //   getPlaylistItemsId(link)
  //     .pipe(
  //       map((playListVideos) => {
  //         downloadSingleAudio(link, isHightQUality);
  //       }),
  //     )
  //     .subscribe();
}

export function getPlaylistInfo(link: string): Observable<AxiosResponse> {
  const playlistId = getPlaylistId(link);
  const apiKey = process.env.YT_API_KEY;
  return from(
    axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`,
    ),
  ).pipe(map((response) => response));
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
  );
}

function getPlaylistId(url: string): string {
  const regex = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
  const match = url.match(regex);

  if (match && match[2]) {
    return match[2];
  } else {
    throw new Error('Invalid YouTube playlist URL');
  }
}
