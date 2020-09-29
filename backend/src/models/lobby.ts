import { FaucetType } from "@common/apiModels";

export interface Lobby {
    id: string;
    title?: string;
    persist?: boolean;
    playback_position: number;
}

export interface MediaObject {
    url: string;
    faucet_type: FaucetType;
    guid: string;
    start_time: number;
    duration?: number;
    image_url?: string;
    title?: string;
}
