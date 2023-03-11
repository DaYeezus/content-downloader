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

export function convertVideoToFlac$(
  stream: internal.Readable,
  filePath: string,
  artistName: string,
): Observable<any> {
  return of(stream).pipe(
    catchError((error) => {
      throw createHttpError('Unable to create media stream');
    }),
    switchMap((_) =>
      of(
        Ffmpeg(stream)
          .toFormat('flac')
          .outputOptions('-metadata', `artist=${artistName}`)
          .audioCodec('flac')
          .audioFrequency(44100)
          .audioChannels(2)
          .audioBitrate(320)
          .audioFilters('aformat=s32')
          .save(filePath),
      ).pipe(
        catchError((error) => {
          throw createHttpError('Unable to convert video to flac');
        }),
      ),
    ),
  );
}

export function convertVideoToMp3$(
  stream: internal.Readable,
  filePath: string,
  artistName: string,
) {
  return of(stream).pipe(
    catchError((error) => {
      throw createHttpError('Unable to create media stream');
    }),
    switchMap((_) =>
      of(
        of(
          Ffmpeg(stream)
            .toFormat('mp3')
            .outputOptions('-metadata', `artist=${artistName}`)
            .audioCodec('libmp3lame')
            .audioFrequency(44100)
            .audioChannels(2)
            .audioBitrate(128)
            .save(filePath),
        ),
      ).pipe(
        catchError((error) => {
          throw createHttpError('Unable to convert video to flac');
        }),
      ),
    ),
  );
}

/**
 * Downloads audio files from a playlist and archives them into a zip file.
 * @param {boolean} isHighQuality - Whether to download high quality audio or not.
 * @param {string} album_name - Name of the directory to be created and archived.
 * @returns {Observable<string>} - Observable that emits the path of the zip file when complete.
 */
export function zipDownloadedAudios(
  isHighQuality: boolean,
  album_name: string,
) {
  return switchMap((downloadedAudios: DownloadedAudio[]) => {
    return new Observable<string>((subscriber) => {
      // Creates a zip archive for the downloaded audio files
      try {
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
        appendDownloadedSongsTOZip(
          downloadedAudios,
          archive,
          isHighQuality,
          output,
        );
        output.on('close', () => {
          subscriber.next(zipFilePath);
          subscriber.complete();
        });

        archive.on('warning', (err) => {
          subscriber.error(err);
        });

        archive.on('error', (err) => {
          subscriber.error(err);
        });
      } catch (err) {
        subscriber.error(err);
      }
    });
  });
}

/**
 * Appends downloaded audio files to the provided zip archive.
 *
 * @param {DownloadedAudio[]} downloadedAudios - Array of objects containing downloaded audio file data.
 * @param {Archiver} archive - Instance of the zip archive.
 * @param {boolean} isHighQuality - Whether the format of the downloaded audio files is high quality (e.g. flac) or not.
 * @param {WriteStream} output - The write stream used by the zip archive.
 * @returns {Void}
 */
export function appendDownloadedSongsTOZip(
  downloadedAudios: DownloadedAudio[],
  archive: Archiver,
  isHighQuality: boolean,
  output: WriteStream,
): void {
  Promise.all(
    downloadedAudios.map((audio) => {
      // Waits until each audio file has been downloaded before appending it to the archive
      return new Promise<void>((resolve, reject) => {
        audio.data.on('end', () => {
          // Append the downloaded audio file to the archive
          archive.append(createReadStream(audio.filePath), {
            name: `${audio.title}.${isHighQuality ? 'flac' : 'mp3'}`,
          });
          resolve();
        });

        audio.data.on('error', (err) => {
          reject(err);
        });
      });
    }),
  )
    .then(async () => {
      // Cleans up the downloaded audio files and finalizes the archive
      try {
        downloadedAudios.forEach((audio) => unlinkSync(audio.filePath));
        await archive.finalize();
        output.close();
      } catch (err) {}
    })
    .catch((err) => {});
}

/**
 * Converts a video stream to either FLAC or MP3 format based on whether isHighQuality parameter is true or false.
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
    ? convertVideoToFlac$(stream, filePath, channelName)
    : convertVideoToMp3$(stream, filePath, channelName);

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
