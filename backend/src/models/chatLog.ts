export interface ChatLog {
    readonly lobby_id: string;
    readonly sender?: string;
    readonly message: string;
    readonly timestamp: Date;
}
