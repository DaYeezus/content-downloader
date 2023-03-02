import {NextFunction, Request, Response} from "express";
import {youtubeContentSchema} from "validators";
import {mergeMap, of} from "rxjs";
import {getYoutubeContentInfo} from "../utils/youtube.utils";
import {videoInfo} from "ytdl-core";

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

export async function getContentInfo(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const {link} = await youtubeContentSchema.parseAsync(req.body);
        getYoutubeContentInfo(link)
            .pipe(
                mergeMap((data: videoInfo) => {
                    return of(res.send(data.videoDetails.title));
                })
            )
            .subscribe();
    } catch (err: any) {
        next(err);
    }
}
