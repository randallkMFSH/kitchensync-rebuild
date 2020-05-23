import { FaucetType } from "./faucet";

export interface Lobby {
    id: string;
    title?: string;
    persist?: boolean;
    playback_position: number;
}

export interface MediaObject {
    lobby_id: string;
    url: string;
    faucet_type: FaucetType;
    list_position: number;
}
