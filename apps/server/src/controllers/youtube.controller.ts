import { NextFunction, Request, Response } from 'express';
import {
  downloadContentFromPlaylistSchema,
  downloadContentFromVideoSchema,
  getYoutubeInfoSchema,
} from 'validators';
import * as fs from 'fs';
import * as path from 'path';
import {
  downloadSingleAudio,
  getPlaylistInfo,
  getYoutubeContentInfo,
} from '../services/youtube.service';
import { getCachedData } from '../services/redis.service';
import { videoInfo } from 'ytdl-core';

export async function getContentInfo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { link } = await getYoutubeInfoSchema.parseAsync(req.body);
    getCachedData(link).subscribe({
      next(info: videoInfo) {
        return res.status(200).json({
          video: {
            title: info.videoDetails.title,
            thumbnail:
              info.videoDetails.thumbnails[
                info.videoDetails.thumbnails.length - 1
              ],
            url: info.videoDetails.video_url,
          },
        });
      },
      error: (err) => next(err),
    });
  } catch (err: any) {
    next(err);
  }
}

export async function downloadFromVideo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { isHighQuality, link } =
      await downloadContentFromVideoSchema.parseAsync(req.body);

    const quality = isHighQuality === 'true';
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      `${Math.floor(Math.random() * 1000000)}.mp3`,
    );
    // TODO : add download form info and get info from cached url that use redis
    downloadSingleAudio(link, quality, filePath).subscribe({
      next(data) {
        data.on('end', () => {
          res.download(filePath, (err) => {
            if (err) {
              console.error(err);
            }

            // Delete the temporary file from the server.
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(err);
              }
            });
          });
        });
      },
      error: (err) => next(err),
    });
  } catch (err: any) {
    next(err);
  }
}

export async function downloadFromPlaylist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { link } = await downloadContentFromPlaylistSchema.parseAsync(
      req.body,
    );
    getPlaylistInfo(link).subscribe({
      next(value) {
        return res.send(value.data);
      },
      error: (err) => next(err),
    });
  } catch (err: any) {
    next(err);
  }
}
