import {
  downloadSingleAudio,
  getYoutubeContentInfo,
  getYoutubePlaylistInfo,
} from '../youtube.service';
import { videoInfo } from 'ytdl-core';
import { concatMap, firstValueFrom, map } from 'rxjs';
import {
  describe,
  test,
  expect,
  assertType,
  beforeAll,
  afterAll,
} from 'vitest';
import { DownloadedAudio } from '../../interfaces/download.interface';
import { redisClient } from '../../conf/redis.conf';
import exp from 'constants';
describe('Youtube service', function () {
  const youtubeVideoLink = 'https://www.youtube.com/watch?v=5hPtU8Jbpg0';
  describe('getYoutubeContentInfo', function () {
    test('should get youtube content successfully', async function () {
      const result = await firstValueFrom(
        getYoutubeContentInfo(youtubeVideoLink),
      );
      expect(result).toBeDefined();
      assertType<videoInfo | undefined>(result);
    });
    test('should throw error video not exist', async function () {
      await expect(
        firstValueFrom(getYoutubePlaylistInfo(youtubeVideoLink + 'something')),
      ).rejects.toThrow();
    });
    test('should throw error for timeout', async function () {
      await setTimeout(() => {}, 5000);
      await expect(
        firstValueFrom(getYoutubePlaylistInfo(youtubeVideoLink)),
      ).rejects.toThrow();
    });
  });
  describe('download single audio', function () {
    beforeAll(async () => {
      await redisClient.connect();
    });
    afterAll(async () => {
      await redisClient.disconnect();
    });

    test('should download file successfully(mp3)', async function () {
      const result = await firstValueFrom(
        downloadSingleAudio(youtubeVideoLink, false),
      );
      expect(result).toBeDefined();
      expect(result.filePath.endsWith('.mp3')).toBe(true); // because isHighQuality is false
      assertType<DownloadedAudio>(result);
    });
    test('should download file successfully(flac)', async function () {
      const result = await firstValueFrom(
        downloadSingleAudio(youtubeVideoLink, true),
      );
      expect(result).toBeDefined();
      expect(result.filePath.endsWith('.flac')).toBe(true); // because isHighQuality is false
      assertType<DownloadedAudio>(result);
    });
    test('should throw error video not exist', async function () {
      await expect(
        firstValueFrom(downloadSingleAudio('notexist url', false)),
      ).rejects.toThrow();
    });
  });
});
