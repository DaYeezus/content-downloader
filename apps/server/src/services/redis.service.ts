import { from, map, mergeMap, Observable } from 'rxjs';
import { videoInfo } from 'ytdl-core';
import { redisClient } from '../conf/redis.conf';
import { FetchedVideoInfo, getYoutubeContentInfo } from './youtube.service';

export function getCachedData(link: string): Observable<videoInfo> {
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
