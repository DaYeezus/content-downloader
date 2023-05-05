import {NextFunction, Request, Response} from 'express';
import * as fs from 'fs';
import {
    downloadAudioSchema,
    downloadAudioFromPlaylistSchema,
    downloadVideoFromPlaylistSchema,
    downloadVideoSchema,
    playlistIdSchema,
    videoIdSchema,
} from '../validators/index';
import {videoInfo} from 'ytdl-core';
import {youtubePlayListResponse} from '../interfaces/youtube-playlist.interface';
import {getCachedVideo, getCachedYoutubePlaylistInfo,} from '../services/redis.service';

import {BadRequest} from 'http-errors';
import contentDisposition from 'content-disposition';
import {downloadAudioFromPlaylist, downloadSingleAudio} from "../services/youtube/youtube.audio.service";
import {downloadSingleVideo, downloadVideoFromPlaylist} from "../services/youtube/youtube.video.service";

export async function getContentInfo(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const {videoId} = await videoIdSchema.parseAsync(req.params);
        if (!videoId) throw new BadRequest('Please insert valid youtube video');
        getCachedVideo(videoId).subscribe({
            next(info: videoInfo) {
                return res.status(200).json({
                    video: {
                        title: info.videoDetails.title,
                        thumbnail:
                            info.videoDetails.thumbnails[
                            info.videoDetails.thumbnails.length - 1
                                ],
                        url: info.videoDetails.video_url,
                        formats: info.formats,
                    },
                });
            },
            error: (err) => next(err),
        });
    } catch (err: any) {
        next(err);
    }
}

export async function downloadAudio(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const {isHighQuality} = await downloadAudioSchema.parseAsync(req.query);
        const {videoId} = await videoIdSchema.parseAsync(req.params);
        if (!videoId) throw new BadRequest('Please insert valid youtube video');
        const quality = isHighQuality === 'true';
        downloadSingleAudio(videoId, quality).subscribe({
            next({data, filePath, title}) {
                data.on('end', () => {
                    res.download(filePath, title, (err) => {
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

export async function downloadVideo(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const {quality} = await downloadVideoSchema.parseAsync(req.query);
        const {videoId} = await videoIdSchema.parseAsync(req.params);
        if (!videoId || !quality) throw new BadRequest('Please insert all params');

        downloadSingleVideo(videoId, quality).subscribe({
            next({data,filePath, title}) {
                data.on("finish", () => {
                    res.download(filePath, title, (err) => {
                        if (err) {
                            console.error(err);
                        }
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    });
                })
            },
            error: (err) => next(err),
        });
    } catch (err: any) {
        next(err);
    }
}

export async function getPlaylistInfo(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const {playlistId} = await playlistIdSchema.parseAsync(req.params);
        if (!playlistId) throw new BadRequest('Please insert valid youtube video');

        getCachedYoutubePlaylistInfo(playlistId).subscribe({
            next(value) {
                const {items, etag} = value as youtubePlayListResponse;
                res.status(200).json({
                    items,
                    etag,
                });
            },
            error(err) {
                next(err);
            },
        });
    } catch (err) {
        next(err);
    }
}

export async function downloadAudioPlaylist(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const {isHighQuality, albumName} =
            await downloadAudioFromPlaylistSchema.parseAsync(req.query);
        const {playlistId} = await playlistIdSchema.parseAsync(req.params);

        if (!playlistId) throw new BadRequest('Please insert valid youtube video');

        const quality = isHighQuality === 'true';
        if (!playlistId || !isHighQuality || !albumName)
            throw new BadRequest('Please insert all params');

        downloadAudioFromPlaylist(playlistId, quality, albumName).subscribe({
            next(value) {
                res.writeHead(200, {
                    'Content-Disposition': contentDisposition(albumName), // Mask non-ANSI chars
                    'Content-Transfer-Encoding': 'binary',
                    'Content-Type': 'application/zip',
                });

                fs.createReadStream(value)
                    .pipe(res)
                    .on('finish', () => {
                        fs.unlink(value, (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    });
            },
            error(err) {
                next(err);
            },
        });
    } catch (err: any) {
        next(err);
    }
}

export async function downloadVideoPlaylist(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const {quality, albumName} =
            await downloadVideoFromPlaylistSchema.parseAsync(req.query);
        const {playlistId} = await playlistIdSchema.parseAsync(req.params);
        if (!playlistId || !quality || !albumName) throw new BadRequest('Please insert all params');
        downloadVideoFromPlaylist(playlistId, quality, albumName).subscribe({
            next(value) {
                res.writeHead(200, {
                    'Content-Disposition': contentDisposition(albumName), // Mask non-ANSI chars
                    'Content-Transfer-Encoding': 'binary',
                    'Content-Type': 'application/zip',
                });

                fs.createReadStream(value)
                    .pipe(res)
                    .on('finish', () => {
                        fs.unlink(value, (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    });
            },
            error(err) {
                next(err);
            },
        });
    } catch (err: any) {
        next(err);
    }
}
