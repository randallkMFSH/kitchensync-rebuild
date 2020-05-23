import { ChatMessageData } from "@common/apiModels";
import { ChatLog } from "@models/chatLog";
import { knex } from "./database";

export const chatTable = () => knex<ChatLog>("chat_logs");

export const saveChatLog = async (lobby_id: string, message: string, sender?: string) => {
    return chatTable().insert({
        lobby_id,
        message,
        sender,
        timestamp: new Date(),
    });
};

export const getChatLogForLobby = (lobby_id: string): Promise<ChatMessageData[]> => {
    return chatTable().where("lobby_id", lobby_id).orderBy("timestamp", "asc").select("message", "sender", "timestamp");
};
