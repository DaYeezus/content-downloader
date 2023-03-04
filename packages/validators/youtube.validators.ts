import { z } from "zod";
import { youtubeContentRegex } from "./regexes";

export const youtubeContentLinkSchema = z
  .string({
    required_error: "Please insert the music link from youtube",
  })
  .regex(youtubeContentRegex);
export type youtubeContentLinkSchema = z.infer<typeof youtubeContentLinkSchema>;
export const getYoutubeInfoSchema = z.object({
  link: youtubeContentLinkSchema,
});
export type getYoutubeInfoType = z.infer<typeof getYoutubeInfoSchema>;
export const downloadYoutubeContentSchema = z.object({
  link: youtubeContentLinkSchema,
  isHighQuality: z.boolean().default(true),
  format: z.enum(["mp3", "zip"]),
});
export type downloadYoutubeContentType = z.infer<
  typeof downloadYoutubeContentSchema
>;
