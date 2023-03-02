import { Request, Response, NextFunction } from "express";
import {
  youtubeContentSchema,
  youtubeContentType,
} from "album-downloader-validators";
import { BadRequest } from "http-errors";
import { map, of } from "rxjs";
export function downloadPlaylist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
  } catch (err: any) {
    next(err);
  }
}

export function downloadSingleTrack(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { link } = req.params;
    of(youtubeContentSchema.parse(link)).pipe(map((link) => {}));
  } catch (err: any) {
    next(err);
  }
}
