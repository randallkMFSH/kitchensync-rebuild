import { Faucet } from "@models/faucet";
import { v4 as generateGuid } from "uuid";

const TWITCH_VOD_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/(?:videos))((\w|-){11})(?:\S+)?/;

const getIdFromTwitchURL = (url: string) => {
    return url.match(
        TWITCH_VOD_URL_REGEX
    )![0];
};



export const TwitchFaucet: Faucet = {
    async attemptToCreateMediaObjectFromUrl(url) {
        if (url.match(TWITCH_VOD_URL_REGEX)) {
            // TODO: Parse start time, which Twitch does in a weird way, from the looks of it.
            // const parsedUrl = URL.parse(url);
            // let start_time = 0;
            // if (parsedUrl.query) {
            //     const params = querystring.parse(parsedUrl.query);
            //     if (params.t && typeof params.t === "string") {
            //         const hoursMatch = params.t.match(/(\d*)h/);
            //         if (hoursMatch) {
            //             start_time += parseInt(hoursMatch[1]) * 60 * 60;
            //         }
            //         const minutesMatch = params.t.match(/(\d*)m/);
            //         if (minutesMatch) {
            //             start_time += parseInt(minutesMatch[1]) * 60;
            //         }
            //         const secondsMatch = params.t.match(/(\d*)s/);
            //         if (secondsMatch) {
            //             start_time += parseInt(secondsMatch[1]);
            //         }
            //         if (!(hoursMatch || minutesMatch || secondsMatch)) {
            //             // none of the previous matched so this must just be a number of seconds
            //             start_time = parseInt(params.t);
            //         }
            //     }
            // }
            const id = getIdFromTwitchURL(url);
            const guid = generateGuid();

            return [
                {
                    url,
                    faucet_type: "Twitch",
                    start_time: 0,
                    image_url: undefined,
                    guid,
                },
            ];
        }
        return undefined;
    },
};