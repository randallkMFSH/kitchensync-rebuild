import { Faucet } from "@models/faucet";
import { MediaObject } from "@models/lobby";
import { v4 as generateGuid } from "uuid";
import { HTML5Faucet } from "./faucets/html5";
import { YoutubeFaucet } from "./faucets/youtube";

const faucets: Faucet[] = [YoutubeFaucet, HTML5Faucet];

export const RootFaucet = {
    async attemptToCreateMediaObjectFromUrl(url: string): Promise<MediaObject[] | undefined> {
        for (const faucet of faucets) {
            const mediaObjects = await faucet.attemptToCreateMediaObjectFromUrl(url);
            if (mediaObjects) {
                return mediaObjects.map((mediaObject) => {
                    if ("guid" in mediaObject) {
                        return mediaObject;
                    } else {
                        return {
                            ...mediaObject,
                            guid: generateGuid(),
                        };
                    }
                });
            }
        }

        return undefined;
    },
};
