import {FfmpegCommand} from 'fluent-ffmpeg';
import {existsSync, unlinkSync} from 'fs';
import {join} from 'path';
import {firstValueFrom} from 'rxjs';
import {Readable} from 'stream';
import {afterAll, assertType, beforeAll, describe, expect, test,} from 'vitest';
import {DownloadedAudio} from '../../interfaces/download.interface';

import {convertStreamToSong, convertVideoToFlac$, convertVideoToMp3$,} from '../convertor.service';

describe('ConvertorServices', () => {
    describe('convertVideoToFlac$', () => {
        const testOutputPath = join(__dirname, '../../test/assets/test.flac'); // path where the converted flac file will be saved

        beforeAll(() => {
            if (existsSync(testOutputPath)) {
                unlinkSync(testOutputPath);
            }
        });

        test('should return a stream that can be used to save the converted flac file', async () => {
            const testReadableStream = new Readable({
                read() {
                },
            });
            const result$ = convertVideoToFlac$(
                testReadableStream,
                testOutputPath,
                'test-artist',
            );
            await expect(firstValueFrom(result$)).resolves.toEqual(expect.anything()); // first, we check if the returned observable emits anything

            const result: any = await new Promise((resolve) =>
                result$.subscribe({
                    next(value) {
                        resolve(value);
                    },
                    error(err) {
                        console.error(err);
                    },
                }),
            );
            expect(typeof result === 'object').toBe(true); // then we check if the returned value is a number (ffmpeg's pid)
            assertType<FfmpegCommand>(result);
        });

        afterAll(() => {
            if (existsSync(testOutputPath)) {
                unlinkSync(testOutputPath);
            }
        });
    });
    describe('convertVideoToMp3$', () => {
        const testOutputPath = join(__dirname, '../../test/assets/test.mp3'); // path where the converted mp3 file will be saved

        beforeAll(() => {
            if (existsSync(testOutputPath)) {
                unlinkSync(testOutputPath);
            }
        });

        test('should return a stream that can be used to save the converted mp3 file', async () => {
            const testReadableStream = new Readable({
                read() {
                },
            });
            const result$ = convertVideoToMp3$(
                testReadableStream,
                testOutputPath,
                'test-artist',
            );
            await expect(firstValueFrom(result$)).resolves.toEqual(expect.anything()); // first, we check if the returned observable emits anything

            const result: any = await new Promise((resolve) =>
                result$.subscribe({
                    next(value) {
                        resolve(value);
                    },
                    error(err) {
                        console.error(err);
                    },
                }),
            );
            expect(typeof result === 'object').toBe(true); // then we check if the returned value is a number (ffmpeg's pid)
            assertType<FfmpegCommand>(result);
        });

        afterAll(() => {
            if (existsSync(testOutputPath)) {
                unlinkSync(testOutputPath);
            }
        });
    });

    describe('convertStreamToSong', () => {
        test('converts a video stream to high quality and returns an object with data of converted stream along with its file path and title details', async () => {
            const testReadableStream = new Readable({
                read() {
                },
            });
            const testFilePath = 'path/to/file';
            const testChannelName = 'channelName';
            const testTitle = 'title';
            const isHighQuality = true;
            const result$ = convertStreamToSong(
                isHighQuality,
                testReadableStream,
                testFilePath,
                testChannelName,
                testTitle,
            );
            const result = firstValueFrom(result$);
            await expect(result).resolves.toBeDefined();
            assertType<DownloadedAudio>(await result);
        });

        test('throws an HTTP error if something goes wrong while converting stream to song', async () => {
            const testReadableStream = new Readable({
                read() {
                },
            });
            const testFilePath = 'path/to/file';
            const testChannelName = 'channelName';
            const testTitle = 'title';
            const isHighQuality = true;

            const result$ = convertStreamToSong(
                isHighQuality,
                testReadableStream,
                testFilePath,
                testChannelName,
                testTitle,
            );
            console.log(await firstValueFrom(result$));

            //   await expect(firstValueFrom(result$)).
        });

        test('converts a video stream to low quality and returns an object with data of converted stream along with its file path and title details', async () => {
            const testReadableStream = new Readable({
                read() {
                },
            });
            const testFilePath = 'low_quality.mp3';
            const testChannelName = 'channelName';
            const testTitle = 'title';
            const isHighQuality = false;
            const result$ = convertStreamToSong(
                isHighQuality,
                testReadableStream,
                testFilePath,
                testChannelName,
                testTitle,
            );
            const result = firstValueFrom(result$);
            await expect(result).resolves.toBeDefined();
            assertType<DownloadedAudio>(await result);
        });
    });
});
