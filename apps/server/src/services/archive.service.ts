import archiver, { Archiver } from "archiver";
import { createReadStream, createWriteStream, unlinkSync, WriteStream } from "fs";
import createHttpError from "http-errors";
import { join } from "path";
import { Observable } from "rxjs";
import { DownloadedAudio } from "../interfaces/download.interface";

/**
 * Downloads audio files from a playlist and archives them into a zip file.
 * @param {boolean} isHighQuality - Whether to download high quality audio or not.
 * @param {string} album_name - Name of the directory to be created and archived.
 * @returns {Observable<string>} - Observable that emits the path of the zip file when complete.
 */
export function zipDownloadedAudios(
    downloadedAudios: DownloadedAudio[],
    isHighQuality: boolean,
    album_name: string,
  ): Observable<string> {
    return new Observable<string>((subscriber) => {
      try {
        // Creates a zip archive for the downloaded audio files
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
  
        archive.on('warning', (err:any) => {
          subscriber.error(err);
        });
  
        archive.on('error', (err:any) => {
          subscriber.error(err);
        });
      } catch (err) {
        subscriber.error(err);
      }
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
  export async function appendDownloadedSongsTOZip(
    downloadedAudios: DownloadedAudio[],
    archive: Archiver,
    isHighQuality: boolean,
    output: WriteStream,
  ): Promise<void> {
    try {
      await Promise.all(
        downloadedAudios.map((audio) => {
          return new Promise((res, rej) => {
            audio.data.on('end', () => {
              archive.append(createReadStream(audio.filePath), {
                name: `${audio.title}.${isHighQuality ? 'flac' : 'mp3'}`,
              });
              res(null);
            });
            audio.data.on('error', (error: any) => {
              throw new Error(error);
            });
          });
        }),
      ).then(async () => {
        downloadedAudios.map((audio) => unlinkSync(audio.filePath));
        await archive.finalize();
        output.close();
      });
    } catch (err: any) {
      throw createHttpError(err);
    }
  }