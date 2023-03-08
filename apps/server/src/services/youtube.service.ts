import archiver from 'archiver';
import axios, { AxiosResponse } from 'axios';
import { FfmpegCommand } from 'fluent-ffmpeg';
import { createWriteStream } from 'fs';
import { HttpError } from 'http-errors';
import path, { join } from 'path';
import {
  catchError,
  combineLatest,
  from,
  map,
  mergeMap,
  Observable,
  switchMap,
  tap,
  toArray,
} from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import ytdl, { videoInfo } from 'ytdl-core';
import { DownloadedAudio } from '../interfaces/download.interface';
import { youtubePlayList } from '../interfaces/youtube-playlist.interface';
import {
  addFileToZip,
  convertVideoToFlac,
  convertVideoToMp3,
} from './convertor.service';
import { getCachedPlaylistVideos, getCachedVideo } from './redis.service';
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

export function downloadSingleAudio(
  link: string,
  isHightQUality = true,
): Observable<DownloadedAudio> {
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
        `${uuidv4()}.mp3`,
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
  isHighQuality: boolean,
  album_name: string,
) {
  return getCachedPlaylistVideos(link).pipe(
    switchMap((links) =>
      from(links).pipe(
        mergeMap((link) => downloadSingleAudio(link, isHighQuality)),
        toArray(),
      ),
    ),
    switchMap(
      (downloadedAudios: DownloadedAudio[]) =>
        new Observable<string>((observer) => {
          const zipFilePath = join(
            __dirname,
            '..',
            '..',
            'public',
            `${album_name}.zip`,
          );
          const output = createWriteStream(zipFilePath);
          const archive = archiver('zip', { zlib: { level: 9 } });
          archive.pipe(output);

          output.on('close', async () => {
            console.log('done');

            await Promise.all(
              downloadedAudios.map((audio) => addFileToZip(archive, audio)),
            );
            archive.finalize();
            observer.next(zipFilePath);
            observer.complete();
            archive.finalize();
          });

          archive.on('warning', (err) => {
            observer.error(err);
          });

          archive.on('error', (err) => {
            observer.error(err);
          });
        }),
    ),
  );
}

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

export function getPlaylistItemsUrls(link: string): Observable<string[]> {
  const videoUrls: Observable<string>[] = [];

  return getPlaylistInfo(link).pipe(
    switchMap((playlist) => {
      from(playlist.data.items as youtubePlayList.Item[])
        .pipe(
          tap((item: youtubePlayList.Item) => {
            videoUrls.push(
              getCachedVideo(item.snippet.resourceId.videoId).pipe(
                map((value) => value.videoDetails.video_url),
                catchError((err) => {
                  throw new HttpError(err);
                }),
              ),
            );
          }),
        )
        .subscribe();

      return combineLatest(videoUrls).pipe(
        map((urls) => urls.filter((url) => url !== '')),
      );
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

function createZipFile(filePaths: string[], folderName: string) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const output = createWriteStream(
    path.join(__dirname, '..', '..', 'public', `${folderName}.zip`),
  );

  archive.pipe(output);

  for (const filename of filePaths) {
    archive.file(join(__dirname, '..', '..', 'public', filename), {
      name: filename,
    });
  }

  archive.finalize();
}
