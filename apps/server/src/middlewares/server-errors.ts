import { NextFunction, Request, Response } from "express";
import { HttpError, NotFound } from "http-errors";
import { StatusCodes } from "http-status-codes";

export function serverErrorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode: StatusCodes =
    err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err?.message || "INTERNAL SERVER ERROR";
  return res.status(statusCode).json({
    statusCode,
    message,
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next(new NotFound("The route you are looking fo does not exist."));
}
