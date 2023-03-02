import {youtubeContentType} from "validators";
import {Job} from "bull";
import {from, Observable} from "rxjs";
import {PassThrough} from "stream";
import ytdl, {videoInfo} from "ytdl-core";

export function getYoutubeContentInfo(link: string): Observable<videoInfo> {
    return from(ytdl.getInfo(link));
}

async function downloadVideo(
    job: Job<{ videoUrl: string }>,
    done: (err?: Error | null, audioStram?: PassThrough) => void,
    isHightQuality: boolean = true
) {
    const {videoUrl} = job.data;
    const audioStream = ytdl(videoUrl, {
        quality: isHightQuality ? "highestaudio" : "lowestaudio",
    }).pipe(new PassThrough());
    done(null, audioStream);
}

export function getYoutubePLaylist(link: youtubeContentType) {
}
