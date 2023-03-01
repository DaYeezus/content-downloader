import { Request, Response, NextFunction } from "express";
import { BadRequest } from "http-errors";
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
  } catch (err: any) {
    next(err);
  }
}
