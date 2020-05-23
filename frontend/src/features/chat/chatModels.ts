export interface ChatLogMessage {
    readonly sender?: string;
    readonly message: string;
    readonly timestamp: Date;
}
