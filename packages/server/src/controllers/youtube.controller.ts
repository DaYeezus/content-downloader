import { Request, Response, NextFunction } from "express";
export function downloadContent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
  } catch (err: any) {
    next(err);
  }
}

export function getContentInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { link } = req.params;
    console.log(link);
  } catch (err: any) {
    next(err);
  }
}
