import { z } from 'zod';
import { youtubePlaylistRegex, youtubeVideoRegex } from './regexes';

export const downloadAudioSchema = z.object({
  isHighQuality: z.string().default('true'),
});

export const downloadAudioFromPlaylistSchema = z.object({
  isHighQuality: z.string().default('true'),
  albumName: z.string(),
});
export const downloadVideoFromPlaylistSchema = z.object({
  quality: z.enum(['high', 'low', 'medium']),
  albumName: z.string(),
});

export const downloadVideoSchema = z.object({
  quality: z.enum(['high', 'low', 'medium']),
});
export const videoUrlSchema = z.object({
  link: z
    .string({
      required_error: 'Please insert the music link from youtube',
    })
    .regex(youtubeVideoRegex, 'Please insert valid video url'),
});
export const playlistUrlSchema = z.object({
  link: z
    .string({
      required_error: 'Please insert the music link from youtube',
    })
    .regex(youtubePlaylistRegex, 'Please insert valid playlist url'),
});

export const videoIdSchema = z.object({
  videoId: z.string({
    required_error: 'Please insert the music link from youtube',
  }),
});
export const playlistIdSchema = z.object({
  playlistId: z.string({
    required_error: 'Please insert the music link from youtube',
  }),
});

function getPlaylistId(url: string): string {
  const regex = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
  const match = url.match(regex);

  if (match && match[2]) {
    return match[2];
  } else {
    throw Error('Invalid YouTube playlist URL');
  }
}
