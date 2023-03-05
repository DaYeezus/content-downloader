import {NextFunction, Request, Response} from 'express';
import {downloadContentFromPlaylistSchema, downloadContentFromVideoSchema, getYoutubeInfoSchema,} from 'validators';
import {map, mergeMap, of} from 'rxjs';

import {videoInfo} from 'ytdl-core';
import * as fs from 'fs';
import * as path from 'path';
import {FfmpegCommand} from 'fluent-ffmpeg';
import {downloadSingleAudio, getPlaylistInfo, getYoutubeContentInfo,} from '../services/youtube.service';

export async function getContentInfo(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const {link} = await getYoutubeInfoSchema.parseAsync(req.body);
        getYoutubeContentInfo(link)
            .pipe(
                mergeMap((data: videoInfo) => {
                    const videoDetails = {
                        title: data.videoDetails.title,

                        image:
                            data.videoDetails.thumbnails[
                            data.videoDetails.thumbnails.length - 1
                                ],
                        url: data.videoDetails.video_url,
                    };
                    return of(
                        res.status(200).json({
                            videoDetails,
                        }),
                    );
                }),
            )
            .subscribe();
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
        const {isHighQuality, link} =
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
        downloadSingleAudio(link, quality, filePath)
            .pipe(
                map((data: FfmpegCommand) => {
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
                }),
            )
            .subscribe();
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
        const {link} = await downloadContentFromPlaylistSchema.parseAsync(
            req.body,
        );
        // await downloadAudioFromPlaylist(link);
        const data = await getPlaylistInfo(link);
        res.status(200).json({
            data,
        });
    } catch (err: any) {
        next(err);
    }
}
