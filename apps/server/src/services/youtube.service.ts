import { Response } from "express";
import Ffmpeg from "fluent-ffmpeg";
import { unlink } from "fs";
import path from "path";
import { from, Observable, of } from "rxjs";
import { getYoutubeInfoType } from "validators";
import ytdl, { videoInfo } from "ytdl-core";

export function getYoutubeContentInfo(link: string): Observable<videoInfo> {
  return from(ytdl.getInfo(link));
}

export function downloadSingleAudio(
  link: string,
  quality: boolean = true,
  filePath: string
): Observable<any> {
  const stream = ytdl(link, {
    filter: "audioonly",
    quality: quality ? "highestaudio" : "lowestaudio",
  });

  return of(
    Ffmpeg(stream)
      .audioBitrate(quality ? 320 : 128)
      .toFormat(quality ? "flac" : "mp3")
      .save(filePath)
  );
}

export function getYoutubePLaylist(link: getYoutubeInfoType) {}
