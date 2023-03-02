import { z } from "zod";

export const youtubeContentSchema = z
  .string({ required_error: "Please the music link from youtube" })
  .regex(
    /^(?:https?:\/\/)?(?:www\.)?(?:(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)|(?:youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+))$/,
    { message: "Please insert correct link" }
  );
export type youtubeContentType = z.infer<typeof youtubeContentSchema>;
