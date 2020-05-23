import { ChatMessageData } from "./apiModels";

export enum MessageType {
    IDENTITY = "IDENTITY",
    PROMOTION = "PROMOTION",
    BAD_NICKNAME = "BAD_NICKNAME",
    BAD_MESSAGE = "BAD_MESSAGE",
    CHAT = "CHAT",
}

export interface IdentityMessage {
    readonly type: MessageType.IDENTITY;
    readonly name: string;
}
export interface PromotionMessage {
    readonly type: MessageType.PROMOTION;
    readonly newHost: string;
}
export interface BadNicknameMessage {
    readonly type: MessageType.BAD_NICKNAME;
    readonly message: string;
}
export interface BadMessageMessage {
    readonly type: MessageType.BAD_MESSAGE;
    readonly message: string;
}
export interface ChatMessage {
    readonly type: MessageType.CHAT;
    readonly chatMessage: Partial<ChatMessageData>;
}

export type LobbyMessage = IdentityMessage | PromotionMessage | BadNicknameMessage | BadMessageMessage | ChatMessage;
