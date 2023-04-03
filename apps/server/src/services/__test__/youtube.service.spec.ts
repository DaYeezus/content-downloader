import {
  getPlaylistItemsUrls,
  getYoutubeContentInfo,
  getYoutubePlaylistInfo,
} from '../youtube/youtube.service';
import ytdl, { videoInfo } from 'ytdl-core';
import { firstValueFrom } from 'rxjs';
import {
  afterAll,
  assertType,
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest';
import {
  DownloadedAudio,
  DownloadedVideo,
} from '../../interfaces/download.interface';
import { redisClient } from '../../conf/redis.conf';
import { config } from 'dotenv';
import { youtubePlayListResponse } from '../../interfaces/youtube-playlist.interface';
import { unlink, unlinkSync } from 'fs';
import {
  downloadAudioFromPlaylist,
  downloadSingleAudio,
} from '../youtube/youtube.audio.service';
import {
  chooseDownloadFormat,
  downloadSingleVideo,
} from '../youtube/youtube.video.service';

describe('Youtube service', function () {
  beforeAll(async () => {
    await redisClient.connect();
    await redisClient.flushAll();
    config();
  });

  afterAll(async () => {
    await redisClient.flushAll();
    await redisClient.disconnect();
  });
  const youtubeVideoLink = 'https://www.youtube.com/watch?v=5hPtU8Jbpg0';
  const playlistId = 'PLcdCdVUWGyjhN6Ea6RL1DX-GpeD8gXmsY';
  const longPlayListId = 'PLDeVhw7bs_K5_jTmR5AxhKHM5we_x7WKM';
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
    test('should getYoutubePlaylistInfo fail playlist had more than 50 items.', async () => {
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
    test('should getYoutubePlaylistInfo fail playlist had more than 50 items.', async () => {
      await expect(
        firstValueFrom(getPlaylistItemsUrls(longPlayListId)),
      ).rejects.toThrow();
    });
  });
  describe('download playlist', () => {
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

  describe('downloadSingleVideo', () => {
    test('should download and return a video in the specified quality', async () => {
      // Replace 'videoId' with the actual ID of the YouTube video you want to test.
      const videoId = 'TyguvcHwE3s';

      // Replace 'quality' with one of the available video qualities: 'high', 'medium', or 'small'.
      const quality = 'high';

      // Call the function and subscribe to its observable.
      const result = await firstValueFrom(
        downloadSingleVideo(videoId, quality),
      );
      expect(result).toBeDefined();
      expect(result.filePath).toContain('.mp4');
      expect(result.title).toBeDefined();
      unlinkSync(result.filePath);
    });
    test('should fail if video not exist', async () => {
      // Replace 'videoId' with the actual ID of the YouTube video you want to test.
      const videoId = 'TyguvcHwE3t';

      // Replace 'quality' with one of the available video qualities: 'high', 'medium', or 'small'.
      const quality = 'high';

      // Call the function and subscribe to its observable.
      downloadSingleVideo(videoId, quality).subscribe({
        error(err) {
          expect(err).toBeDefined();
        },
      });
    }, 60000);
  });

  describe('chooseDownloadFormat', () => {
    let info: videoInfo;
    beforeAll(async () => {
      info = await ytdl.getInfo(youtubeVideoLink);
    });
    test('should return the high quality video format when "high" is passed in as quality', () => {
      const result: {
        downloadVideoFormat: ytdl.videoFormat;
        downloadAudioFormat: ytdl.videoFormat;
      } = chooseDownloadFormat(info, 'high');
      expect(result.downloadVideoFormat).toEqual({
        quality: 'hd1080',
        hasAudio: false,
        hasVideo: true,
      });
      expect(result.downloadAudioFormat).toEqual({
        quality: 'small',
        hasAudio: true,
        hasVideo: true,
      });
    });

    test('should return the medium quality video format when "medium" is passed in as quality', () => {
      const result: {
        downloadVideoFormat: ytdl.videoFormat;
        downloadAudioFormat: ytdl.videoFormat;
      } = chooseDownloadFormat(info, 'medium');
      expect(result.downloadVideoFormat).toEqual({
        quality: 'medium',
        hasAudio: true,
        hasVideo: true,
      });
      expect(result.downloadAudioFormat).toEqual({
        quality: 'small',
        hasAudio: true,
        hasVideo: true,
      });
    });

    test('should return the small quality video format when any other value is passed in as quality', () => {
      const result: {
        downloadVideoFormat: ytdl.videoFormat;
        downloadAudioFormat: ytdl.videoFormat;
      } = chooseDownloadFormat(info, 'low');
      expect(result.downloadVideoFormat).toEqual({
        quality: 'small',
        hasAudio: true,
        hasVideo: true,
      });
      expect(result.downloadAudioFormat).toEqual({
        quality: 'small',
        hasAudio: true,
        hasVideo: true,
      });
    });
  });
});
