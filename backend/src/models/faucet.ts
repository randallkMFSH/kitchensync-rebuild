import { MediaObject } from "./lobby";

export type MediaObjectWithoutGuid = Omit<MediaObject, "guid">;
export interface Faucet {
    attemptToCreateMediaObjectFromUrl(url: string): Promise<(MediaObject | MediaObjectWithoutGuid)[] | undefined>;
}
