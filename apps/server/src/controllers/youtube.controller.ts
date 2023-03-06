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
    downloadSingleAudio(link, quality).subscribe({
      next({ data, filePath, title }) {
        data.on('end', () => {
          res.download(filePath, `${title}`, (err) => {
            if (err) {
              console.error(err);
            }
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
