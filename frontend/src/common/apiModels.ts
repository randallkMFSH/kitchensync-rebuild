export interface ChatMessageData {
    readonly sender?: string;
    readonly message: string;
    readonly timestamp: number;
}

export interface LobbyData {
    chatLog: ChatMessageData[];
    members: string[];
    host: string | undefined;
    // todo: faucet stuff
}
