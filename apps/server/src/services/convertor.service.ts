import Ffmpeg from "fluent-ffmpeg";
import { of } from "rxjs";
import internal from "stream";

export function convertVideoToFlac(
  stream: internal.Readable,
  filePath: string,
  artistName: string,
) {
  return of(
    Ffmpeg(stream)
      .toFormat('flac')
      .outputOptions('-metadata', `artist=${artistName}`)
      .audioCodec('flac')
      .audioFrequency(44100)
      .audioChannels(2)
      .audioBitrate(320)
      .audioFilters('aformat=s32')
      .save(filePath),
  );
}

export function convertVideoToMp3(
  stream: internal.Readable,
  filePath: string,
  artistName: string,
) {
  return of(
    Ffmpeg(stream)
      .toFormat('mp3')
      .outputOptions('-metadata', `artist=${artistName}`)
      .audioCodec('libmp3lame')
      .audioFrequency(44100)
      .audioChannels(2)
      .audioBitrate(128)
      .save(filePath),
  );
}
