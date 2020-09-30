import { ChatMessageData, MediaObject } from "./apiModels";
import { AsJSON } from "./util/convenienceTypes";

export enum MessageType {
    IDENTITY = "IDENTITY",
    WELCOME = "WELCOME",
    PROMOTION = "PROMOTION",
    BAD_NICKNAME = "BAD_NICKNAME",
    BAD_MESSAGE = "BAD_MESSAGE",
    CHAT = "CHAT",
    UPDATE_USER_LIST = "UPDATE_USER_LIST",
    UPDATE_TITLE = "UPDATE_TITLE",
    UPDATE_PERSIST = "UPDATE_PERSIST",
    ADD_TO_QUEUE = "ADD_TO_QUEUE",
    SET_QUEUE = "SET_QUEUE",
    MEDIA_FAILURE = "MEDIA_FAILURE",
    CHANGE_MEDIA = "CHANGE_MEDIA",
    REMOVE_ITEM_FROM_QUEUE = "REMOVE_ITEM_FROM_QUEUE",
    SKIP_TO_ITEM = "SKIP_TO_ITEM",
    SET_MEDIA_DURATION = "SET_MEDIA_DURATION",
    PLAY = "PLAY",
    PAUSE = "PAUSE",
    SEEK = "SEEK",
    ENDED = "ENDED",
}

export interface IdentityMessage {
    readonly type: MessageType.IDENTITY;
    readonly name: string;
}
export interface WelcomeMessage {
    readonly type: MessageType.WELCOME;
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
    readonly chatMessage: AsJSON<Partial<ChatMessageData>>;
}
export interface UpdateUserListMessage {
    readonly type: MessageType.UPDATE_USER_LIST;
    readonly userList: string[];
}
export interface UpdateTitleMessage {
    readonly type: MessageType.UPDATE_TITLE;
    readonly title: string;
}
export interface UpdatePersistMessage {
    readonly type: MessageType.UPDATE_PERSIST;
    readonly persist: boolean;
}
export interface AddItemToQueueMessage {
    readonly type: MessageType.ADD_TO_QUEUE;
    readonly url: string;
}
export interface ChangeMediaMessage {
    readonly type: MessageType.CHANGE_MEDIA;
    readonly url: string;
}
export interface MediaFailureMessage {
    readonly type: MessageType.MEDIA_FAILURE;
    readonly message: string | undefined;
}
export interface SetQueueMessage {
    readonly type: MessageType.SET_QUEUE;
    readonly queue: MediaObject[];
}
export interface RemoveItemFromQueueMessage {
    readonly type: MessageType.REMOVE_ITEM_FROM_QUEUE;
    readonly guid: string;
}
export interface SkipToItemMessage {
    readonly type: MessageType.SKIP_TO_ITEM;
    readonly guid: string;
}
export interface SetMediaDurationMessage {
    readonly type: MessageType.SET_MEDIA_DURATION;
    readonly guid: string;
    readonly duration: number | undefined;
}
export interface PlayMessage {
    readonly type: MessageType.PLAY;
    readonly seconds: number | undefined;
}
export interface PauseMessage {
    readonly type: MessageType.PAUSE;
    readonly seconds: number | undefined;
}
export interface SeekMessage {
    readonly type: MessageType.SEEK;
    readonly seconds: number;
}
export interface EndedMessage {
    readonly type: MessageType.ENDED;
}

export type LobbyMessage =
    | IdentityMessage
    | WelcomeMessage
    | PromotionMessage
    | BadNicknameMessage
    | BadMessageMessage
    | ChatMessage
    | UpdateUserListMessage
    | UpdateTitleMessage
    | UpdatePersistMessage
    | AddItemToQueueMessage
    | RemoveItemFromQueueMessage
    | SkipToItemMessage
    | ChangeMediaMessage
    | SetQueueMessage
    | MediaFailureMessage
    | SetMediaDurationMessage
    | PlayMessage
    | PauseMessage
    | SeekMessage
    | EndedMessage;
