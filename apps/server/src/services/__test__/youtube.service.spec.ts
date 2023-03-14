import {
  downloadAllVideosFromPlaylist,
  downloadAudioFromPlaylist,
  downloadSingleAudio,
  getPlaylistItemsUrls,
  getYoutubeContentInfo,
  getYoutubePlaylistInfo,
} from '../youtube.service';
import { videoInfo } from 'ytdl-core';
import { concatMap, first, firstValueFrom, map } from 'rxjs';
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
import { config } from 'dotenv';
import {
  youtubePlayList,
  youtubePlayListResponse,
} from '../../interfaces/youtube-playlist.interface';
import { afterEach, beforeEach } from 'node:test';
import { rm, unlink, unlinkSync } from 'fs';
describe('Youtube service', function () {
  beforeAll(async () => {
    await redisClient.connect();
    await redisClient.flushAll();
    config();
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await redisClient.flushAll();
  });
  const youtubeVideoLink = 'https://www.youtube.com/watch?v=5hPtU8Jbpg0';
  const playlistId = 'PLcdCdVUWGyjhN6Ea6RL1DX-GpeD8gXmsY';
  const longPlayListId = 'PLxA687tYuMWjdjPnwbOt_Nmgt3jnT1Yqi';
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
  describe('getYoutubePlaylistInfo', () => {
    test('should getYoutubePlaylistInfo successfully.', async () => {
      const result = await firstValueFrom(getYoutubePlaylistInfo(playlistId));
      expect(result.status).toBe(200);
      expect(result.data).toBeTypeOf('object');
      assertType<youtubePlayListResponse>(result.data);
    });

    test('should getYoutubePlaylistInfo fail not a valid playList id.', async () => {
      await expect(
        firstValueFrom(getYoutubePlaylistInfo('someInvalidId')),
      ).rejects.toThrow();
    });
    test('should getYoutubePlaylistInfo fail playlist had more than 15 items.', async () => {
      await expect(
        firstValueFrom(getYoutubePlaylistInfo(longPlayListId)),
      ).rejects.toThrow();
    });
  });
  describe('getPlaylistItemsUrls', () => {
    test('should getPlaylistItemsUrls', async () => {
      const result = await firstValueFrom(getPlaylistItemsUrls(playlistId));
      expect(result).not.toBe([]);
      expect(result.length).toBeGreaterThan(0);
      assertType<string[]>(result);
    });
    test('should getYoutubePlaylistInfo fail invalid playlist id.', async () => {
      await expect(
        firstValueFrom(getPlaylistItemsUrls('invalidPlaylistId')),
      ).rejects.toThrow();
    });
    test('should getYoutubePlaylistInfo fail playlist had more than 15 items.', async () => {
      await expect(
        firstValueFrom(getPlaylistItemsUrls(longPlayListId)),
      ).rejects.toThrow();
    });
  });
  describe('download playlist', () => {
    test('should downloadAllVideosFromPlaylist', async () => {
      const videoIds = await firstValueFrom(getPlaylistItemsUrls(playlistId));
      const result = await firstValueFrom(
        downloadAllVideosFromPlaylist(videoIds, false, () =>
          console.log('error'),
        ),
      );
      expect(result).toBeDefined();
      expect(result.length).greaterThan(0);
      assertType<DownloadedAudio[]>(result);
      result.map((r) =>
        unlink(r.filePath, (err) => {
          if (err) console.log(err);
        }),
      );
    }, 60000);

    test('should downloadAudioFromPlaylist', async () => {
      const result = await firstValueFrom(
        downloadAudioFromPlaylist(playlistId, false, 'test-album'),
      );
      expect(result).toBeDefined();
      expect(result).toBeTypeOf('string');
      expect(result.endsWith('.zip')).toBe(true);
      unlinkSync(result);
    }, 60000);
    test('should downloadAudioFromPlaylist fail invalid playlist id', async () => {
      await expect(
        firstValueFrom(
          downloadAudioFromPlaylist('invalid id', false, 'test-album'),
        ),
      ).rejects.toThrow();
    }, 60000);
  });
});
