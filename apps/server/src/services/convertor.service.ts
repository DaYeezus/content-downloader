import archiver, { Archiver } from 'archiver';
import Ffmpeg from 'fluent-ffmpeg';
import {
  createReadStream,
  createWriteStream,
  unlinkSync,
  WriteStream,
} from 'fs';
import createHttpError from 'http-errors';
import { join } from 'path';
import { catchError, Observable, of, switchMap } from 'rxjs';
import internal from 'stream';
import { DownloadedAudio } from '../interfaces/download.interface';

export function convertVideoToHighQualityMp3$(
  stream: internal.Readable,
  filePath: string,
  artistName: string,
) {
  try {
    return of(
      Ffmpeg(stream)
        .toFormat('mp3')
        .outputOptions('-metadata', `artist=${artistName}`)
        .audioCodec('libmp3lame')
        .audioFrequency(44100)
        .audioChannels(2)
        .audioBitrate(320)
        .audioFilters('aformat=s32')
        .save(filePath),
    );
  } catch (err: any) {
    throw createHttpError(err);
  }
}

export function convertVideoToLowQualityMp3$(
  stream: internal.Readable,
  filePath: string,
  artistName: string,
) {
  try {
    return of(
      Ffmpeg(stream)
        .toFormat('mp3')
        .outputOptions('-metadata', `artist=${artistName}`)
        .audioCodec('libmp3lame')
        .audioFrequency(44100)
        .audioChannels(1)
        .audioBitrate(128)
        .save(filePath),
    );
  } catch (err: any) {
    throw createHttpError(err);
  }
}

/**
 * Converts a video stream to either high quality or low quality MP3 file based on whether isHighQuality parameter is true or false.
 *
 * @param {boolean} isHighQuality - Whether to convert to high quality FLAC or not MP3.
 * @param {internal.Readable} stream - The video stream that needs to be converted.
 * @param {string} filePath - The location at which the converted audio file needs to be saved.
 * @param {string} channelName - The name of the channel that the song belongs to.
 * @param {string} title - The title of the song/video.
 *
 * @returns {Observable<{data, filePath, title}>} - An observable that returns an object with the data of the converted stream along with its file path and title details.
 */
export function convertStreamToSong(
  isHighQuality: boolean,
  stream: internal.Readable,
  filePath: string,
  channelName: string,
  title: string,
): Observable<DownloadedAudio> {
  // Determines the conversion of the given stream to FLAC or MP3
  const command$ = isHighQuality
    ? convertVideoToHighQualityMp3$(stream, filePath, channelName)
    : convertVideoToLowQualityMp3$(stream, filePath, channelName);

  // Return converted stream data along with file path and title
  return command$.pipe(
    switchMap((data) => {
      return of({
        data,
        filePath,
        title,
      });
    }),
    catchError((err) => {
      // Throw an HTTP error if something goes wrong
      throw createHttpError(err);
    }),
  );
}
