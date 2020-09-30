import { Faucet } from "@models/faucet";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import { v4 as generateGuid } from "uuid";

async function getFaucetType(url: string): Promise<"HTML5Video" | "HTML5Audio" | undefined> {
    const response = await fetch(url, {
        method: "HEAD",
    });
    let type = response.headers.get("content-type");

    switch (type) {
        case "video/mp4":
        case "video/webm":
        case "video/ogg":
        case "application/ogg":
            return "HTML5Video";
        case "audio/mpeg":
        case "audio/webm":
        case "audio/ogg":
        case "audio/wave":
        case "audio/wav":
        case "audio/x-wav":
        case "audio/x-pn-wav":
        case '"application/octet-stream";': // newgrounds identifies mp3s with this
            return "HTML5Audio";
        default:
            return undefined;
    }
}

async function getThumbnailForMedia(url: string, guid: string) {
    const thumbnailFilename = `thumbnails/${guid}.png`;

    await fs.promises.mkdir(path.join("static", "thumbnails"), { recursive: true });

    return new Promise<string | undefined>((resolve, reject) => {
        ffmpeg(url)
            .frames(1)
            .videoFilter("scale=400:-2")
            .setStartTime(10)
            .on("end", () => {
                resolve(thumbnailFilename);
            })
            .on("error", (e) => {
                console.log("failed to get thumbnail for", url, e);
                resolve(undefined);
            })
            .saveToFile(path.join("static", thumbnailFilename));
    });
}

export const HTML5Faucet: Faucet = {
    async attemptToCreateMediaObjectFromUrl(url) {
        const faucet_type = await getFaucetType(url);
        if (faucet_type) {
            const guid = generateGuid();
            const image_url = await getThumbnailForMedia(url, guid);

            return [
                {
                    url,
                    faucet_type: faucet_type,
                    start_time: 0,
                    image_url,
                    guid,
                },
            ];
        }

        return undefined;
    },
};
