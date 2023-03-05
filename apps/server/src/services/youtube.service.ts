import axios from 'axios';
import Ffmpeg from 'fluent-ffmpeg';
import {from, Observable, of} from 'rxjs';
import ytdl, {videoInfo} from 'ytdl-core';

export function getYoutubeContentInfo(link: string): Observable<videoInfo> {
    return from(ytdl.getInfo(link));
}

export function downloadSingleAudio(
    link: string,
    quality = true,
    filePath: string,
): Observable<any> {
    const stream = ytdl(link, {
        filter: 'audioonly',
        quality: quality ? 'highestaudio' : 'lowestaudio',
    });

    return of(
        Ffmpeg(stream)
            .audioBitrate(quality ? 320 : 128)
            .toFormat(quality ? 'flac' : 'mp3')
            .save(filePath),
    );
}

export async function downloadAudioFromPlaylist(link: string) {
    await getPlaylistItemsId(link);
}

export async function getPlaylistInfo(link: string) {
    const playlistId = getPlaylistId(link);
    const apiKey = process.env.YT_API_KEY;
    const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`,
    );
    return response.data;
}

export async function getPlaylistItemsId(link: string) {
    const playlist = await getPlaylistInfo(link);
    const videoIds: string[] = [];

    playlist.data.items.forEach((item: any) => {
        console.log(item);

        videoIds.push(item.snippet.resourceId.videoId);
    });
    return videoIds;
}

function getPlaylistId(url: string): string {
    const regex = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
    const match = url.match(regex);

    if (match && match[2]) {
        return match[2];
    } else {
        throw new Error('Invalid YouTube playlist URL');
    }
}
