import archiver, {Archiver} from 'archiver';
import {createReadStream, createWriteStream, unlink, WriteStream,} from 'fs';
import createHttpError from 'http-errors';
import {join} from 'path';
import {Observable} from 'rxjs';
import {DownloadedAudio, DownloadedVideo} from '../interfaces/download.interface';

/**
 * Downloads content files from a playlist and archives them into a zip file.
 * @param downloadedContent
 * @param {boolean} isHighQuality - Whether to download high quality content or not.
 * @param {string} album_name - Name of the directory to be created and archived.
 * @returns {Observable<string>} - Observable that emits the path of the zip file when complete.
 */
export function zipDownloadedContent(
    downloadedContent: DownloadedAudio[] | DownloadedVideo[],
    isHighQuality: boolean | string,
    album_name: string,
): Observable<string> {
    return new Observable<string>((subscriber) => {
        try {
            // Creates a zip archive for the downloaded content files
            const zipFilePath = join(
                __dirname,
                '..',
                '..',
                'public',
                `${album_name}.zip`,
            );
            const output = createWriteStream(zipFilePath);
            const archive = archiver('zip', {zlib: {level: 9}});
            archive.pipe(output);
            appendDownloadedContentToZip(
                downloadedContent,
                archive,
                isHighQuality,
                output,
            )
            output.on('close', () => {
                subscriber.next(zipFilePath);
                subscriber.complete();
            });

            archive.on('warning', (err: any) => {
                subscriber.error(err);
            });

            archive.on('error', (err: any) => {
                subscriber.error(err);
            });

        } catch (err) {
            subscriber.error(err);
        }
    });
}

/**
 * Appends downloaded content files to the provided zip archive.
 *
 * @param {DownloadedAudio[]} downloadedContent - Array of objects containing downloaded content file data | DownloadedAudio[.
 * @param {Archiver} archive - Instance of the zip archive.
 * @param {boolean} isHighQuality - Whether the format of the downloaded content files is high quality (e.g. flac) or not.
 * @param {WriteStream} output - The write stream used by the zip archive.
 * @returns {Void}
 */
export async function appendDownloadedContentToZip(
    downloadedContent:DownloadedAudio[] | DownloadedVideo[],
    archive: Archiver,
    isHighQuality: boolean|string,
    output: WriteStream,
): Promise<void> {
    try {
        await Promise.all(
            downloadedContent.map((content) => {
                return new Promise((res, rej) => {
                    if(content.data instanceof WriteStream){
                        content.data.on(  'finish', () => {
                            archive.append(createReadStream(content.filePath), {
                                name: `${content.title}.mp4`,
                            });
                            res(null);
                        });
                    }else{
                        content.data.on(  'end', () => {
                            archive.append(createReadStream(content.filePath), {
                                name: `${content.title}.${isHighQuality ? 'flac' : 'mp3'}`,
                            });
                            res(null);
                        });
                    }

                    content.data.on('error', (error: any) => {
                        rej(error);
                    });
                });
            }),
        ).then(async () => {
            downloadedContent.map((content) =>
                unlink(content.filePath, (err: any) => {
                    if (err) throw new Error(err);
                }),
            );
            await archive.finalize();
            output.close();
        });
    } catch (err: any) {
        throw createHttpError(err);
    }
}
