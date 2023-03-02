import {z} from "zod";

export const youtubeContentSchema = z.object({
    link: z.string({
        required_error: "Please insert the music link from youtube",
    }),
});
export type youtubeContentType = z.infer<typeof youtubeContentSchema>;
