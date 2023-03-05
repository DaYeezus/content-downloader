import { z } from 'zod';
import { youtubePlaylistRegex, youtubeVideoRegex } from './regexes';

export const getYoutubeInfoSchema = z.object({
  link: z
    .string({
      required_error: 'Please insert the music link from youtube',
    })
    .regex(youtubeVideoRegex),
});
export type getYoutubeInfoType = z.infer<typeof getYoutubeInfoSchema>;
export const downloadContentFromVideoSchema = z.object({
  link: z
    .string({
      required_error: 'Please insert the music link from youtube',
    })
    .regex(youtubeVideoRegex),
  isHighQuality: z.string().default('true'),
});

export const downloadContentFromPlaylistSchema = z.object({
  link: z
    .string({
      required_error: 'Please insert the music link from youtube',
    })
    .regex(youtubePlaylistRegex),
  isHighQuality: z.string().default('true'),
  format: z.enum(['mp3', 'zip']),
});
