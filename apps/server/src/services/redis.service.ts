import { from, map, Observable } from 'rxjs';
import { videoInfo } from 'ytdl-core';
import { redisClient } from '../conf/redis.conf';
import { getPlaylistItemsUrls, getYoutubeContentInfo } from './youtube.service';

export function getCachedVideo(link: string): Observable<videoInfo> {
  return new Observable((observer) => {
    from(redisClient.get(link))
      .pipe(
        map((result) => {
          if (result) {
            observer.next(JSON.parse(result));
            observer.complete();
          } else {
            getYoutubeContentInfo(link).subscribe({
              next(data) {
                redisClient.set(link, JSON.stringify(data), { EX: 3600 }); // cache for 60 minute
                observer.next(data);
                observer.complete();
              },
              error(err) {
                observer.error(err);
              },
            });
          }
        }),
      )
      .subscribe();
  });
}
export function getCachedPlaylistVideos(link: string): Observable<string[]> {
  return new Observable((observer) => {
    from(redisClient.get(link))
      .pipe(
        map((result) => {
          if (result) {
            observer.next(JSON.parse(result));
            observer.complete();
          } else {
            getPlaylistItemsUrls(link).subscribe({
              next(data) {
                redisClient.set(link, JSON.stringify(data), { EX: 3600 });
                observer.next(data);
                observer.complete();
              },
              error(err) {
                observer.error(err);
              },
            });
          }
        }),
      )
      .subscribe();
  });
}
