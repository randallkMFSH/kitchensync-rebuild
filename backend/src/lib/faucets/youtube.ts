import { Faucet, MediaObjectWithoutGuid } from "@models/faucet";
import { google, youtube_v3 } from "googleapis";
import { parse, toSeconds } from "iso8601-duration";
import querystring from "querystring";
import URL from "url";

if (!process.env.YOUTUBE_API_KEY) {
    throw "Missing YOUTUBE_API_KEY environment variable";
}

const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

const YOUTUBE_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/;
const YOUTUBE_PLAYLIST_REGEX = /.*(?:youtube.be\/|list=)([^#\&\?<]*)/;

const getIdFromYoutubeURL = (url: string) => {
    return url.match(
        /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
    )![1];
};

function mapYoutubeDataToMediaObject(
    url: string,
    start_time: number,
    video: youtube_v3.Schema$Video | youtube_v3.Schema$PlaylistItem
) {
    let duration: number | undefined;
    let title: string | undefined;
    let image_url: string | undefined;
    if (video.contentDetails && "duration" in video.contentDetails) {
        const durationString = video.contentDetails.duration;
        if (durationString) {
            duration = toSeconds(parse(durationString));
        }
    }
    title = video.snippet?.title || undefined;
    const thumbnails = video.snippet?.thumbnails;
    if (thumbnails) {
        const thumbnailToUse = thumbnails.high || thumbnails.standard || thumbnails.medium || thumbnails.default;
        image_url = thumbnailToUse?.url || undefined;
    }

    return {
        url,
        faucet_type: "Youtube",
        start_time,
        duration,
        title,
        image_url,
    } as const;
}

export const YoutubeFaucet: Faucet = {
    async attemptToCreateMediaObjectFromUrl(url) {
        if (url.match(YOUTUBE_URL_REGEX)) {
            const parsedUrl = URL.parse(url);
            let start_time = 0;
            if (parsedUrl.query) {
                const params = querystring.parse(parsedUrl.query);
                if (params.t && typeof params.t === "string") {
                    const hoursMatch = params.t.match(/(\d*)h/);
                    if (hoursMatch) {
                        start_time += parseInt(hoursMatch[1]) * 60 * 60;
                    }
                    const minutesMatch = params.t.match(/(\d*)m/);
                    if (minutesMatch) {
                        start_time += parseInt(minutesMatch[1]) * 60;
                    }
                    const secondsMatch = params.t.match(/(\d*)s/);
                    if (secondsMatch) {
                        start_time += parseInt(secondsMatch[1]);
                    }
                    if (!(hoursMatch || minutesMatch || secondsMatch)) {
                        // none of the previous matched so this must just be a number of seconds
                        start_time = parseInt(params.t);
                    }
                }
            }
            const id = getIdFromYoutubeURL(url);
            const youtubeMetadata = await youtube.videos.list({
                id: [id],
                part: ["snippet", "contentDetails"],
            });
            const items = youtubeMetadata.data.items;
            if (items && items.length > 0) {
                return items.map((item) => mapYoutubeDataToMediaObject(url, start_time, item));
            }
        } else {
            const playlistMatch = url.match(YOUTUBE_PLAYLIST_REGEX);
            if (playlistMatch) {
                const playlistId = playlistMatch[1];
                if (playlistId) {
                    const items: MediaObjectWithoutGuid[] = [];
                    let nextPageToken: string | undefined;
                    do {
                        const page = await youtube.playlistItems.list({
                            part: ["snippet", "contentDetails"],
                            maxResults: 50,
                            playlistId,
                            pageToken: nextPageToken,
                        });
                        nextPageToken = page.data.nextPageToken || undefined;
                        page.data.items?.forEach((video) => {
                            if (video.contentDetails?.videoId) {
                                items.push(
                                    mapYoutubeDataToMediaObject(
                                        `https://www.youtube.com/watch?v=${video.contentDetails.videoId}`,
                                        0,
                                        video
                                    )
                                );
                            }
                        });
                    } while (nextPageToken);

                    return items;
                }
            }
        }
        return undefined;
    },
};
