import { ChatMessageData, FIELD_SEPARATOR } from "@common/apiModels";
import { Lists, redis, Sets } from "./redis";

export const saveChatLog = async (lobby_id: string, message: string, sender?: string) => {
    return redis.rpush(
        `${Sets.Lobbies}:${lobby_id}:${Lists.Chatlog}`,
        [sender, message, Date.now()].join(FIELD_SEPARATOR)
    );
};

export const getChatLogForLobby = async (lobby_id: string): Promise<ChatMessageData[]> => {
    const messages: string[] = await redis.lrange(`${Sets.Lobbies}:${lobby_id}:${Lists.Chatlog}`, 0, -1);
    return messages.map((message) => {
        const messageParts = message.split(FIELD_SEPARATOR);
        return {
            sender: messageParts[0] === "" ? undefined : messageParts[0],
            message: messageParts[1],
            timestamp: new Date(parseInt(messageParts[2])),
        };
    });
};
