import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import {
  downloadContentFromPlaylistSchema,
  downloadContentFromVideoSchema,
  getYoutubeInfoSchema,
} from 'validators';
import { videoInfo } from 'ytdl-core';
import { getCachedVideo } from '../services/redis.service';
import {
  downloadAudioFromPlaylist,
  downloadSingleAudio,
} from '../services/youtube.service';

export async function getContentInfo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { link } = await getYoutubeInfoSchema.parseAsync(req.body);
    getCachedVideo(link).subscribe({
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
          res.status(200).download(filePath, title, (err) => {
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
    const { link, isHighQuality, albumName } =
      await downloadContentFromPlaylistSchema.parseAsync(req.body);

    const quality = isHighQuality === 'true';
    downloadAudioFromPlaylist(link, quality, albumName).subscribe({
      next(value) {
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=' + albumName,
        );
        res.setHeader('Content-Type', 'application/zip');
        res.status(200).download(value, albumName, (err) => {
          if (err) {
            console.error(err);
          }
          fs.unlink(value, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });
      },
    });
  } catch (err: any) {
    next(err);
  }
}
