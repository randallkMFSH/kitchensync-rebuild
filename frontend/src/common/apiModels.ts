import { AsJSON } from "./util/convenienceTypes";

/**
 * This character is part of the Private Use Area in unicode.
 * There's no valid reason to be using it in your name or messages, and
 * so it's safe to both disallow sending it and use it as a separator in string data.
 */
export const FIELD_SEPARATOR = `\uE001`;

export type FaucetType = "Youtube" | "HTML5Video" | "HTML5Audio" | "Twitch";

export interface ChatMessageData {
    readonly sender?: string;
    readonly message: string;
    readonly timestamp: Date;
}

export interface MediaObject {
    readonly url: string;
    readonly faucet_type: FaucetType;
    readonly guid: string;
    readonly start_time: number;
    readonly duration?: number;
    readonly image_url?: string;
    readonly title?: string;
}

export interface LobbyData {
    chatLog: ChatMessageData[];
    members: string[];
    host: string | undefined;
    title: string;
    persist?: boolean;
    queue: MediaObject[];
    paused: boolean;
    playback_position: number;
}

export type LobbyDataOverWire = AsJSON<LobbyData>;
