import {Job} from "bull";
import {PassThrough} from "stream";
import archiver from "archiver";
import {v4 as uuid} from "uuid";

export async function zipAudioFiles(
    job: Job<{ fileStreams: PassThrough[] }>,
    done: (err?: Error | null, returnValue?: { zipStream: PassThrough }) => void
) {
    const {fileStreams} = job.data;
    const zipStream = new PassThrough();
    const archive = archiver("zip");

    zipStream.on("close", () => {
        console.log(`Zip stream has been finalized`);
        done();
    });

    archive.on("error", (err) => {
        throw err;
    });

    archive.pipe(zipStream);

    // Add all the audio streams to the zip archive
    for (const fileStream of fileStreams) {
        archive.append(fileStream, {name: `${Date.now()}_${uuid()}.mp3`});
    }

    // Finalize the archive and return the zip stream
    archive.finalize();
    done(null, {zipStream});
}
