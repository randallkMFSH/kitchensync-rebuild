import { FaucetType, FIELD_SEPARATOR } from "@common/apiModels";
import { MediaObject } from "@models/lobby";
import { Lists, redis, Sets } from "./redis";

const serializeMediaObject = (mediaObject: MediaObject) => {
    return [
        mediaObject.url,
        mediaObject.faucet_type,
        mediaObject.guid,
        mediaObject.start_time,
        mediaObject.duration,
        mediaObject.title,
        mediaObject.image_url,
    ].join(FIELD_SEPARATOR);
};

export const addMediaObjectToQueue = async (lobby_id: string, mediaObject: MediaObject) => {
    return redis.rpush(`${Sets.Lobbies}:${lobby_id}:${Lists.Queue}`, serializeMediaObject(mediaObject));
};

export const getQueueForLobby = async (lobby_id: string): Promise<MediaObject[]> => {
    const queue: string[] = await redis.lrange(`${Sets.Lobbies}:${lobby_id}:${Lists.Queue}`, 0, -1);
    return queue.map((queueItem) => {
        const itemParts = queueItem.split(FIELD_SEPARATOR);
        return {
            url: itemParts[0],
            faucet_type: itemParts[1] as FaucetType,
            guid: itemParts[2],
            start_time: (itemParts[3] && parseFloat(itemParts[3])) || 0,
            duration: (itemParts[4] && parseFloat(itemParts[4])) || 0,
            title: itemParts[5] || undefined,
            image_url: itemParts[6] || undefined,
        };
    });
};

export const saveQueue = async (lobby_id: string, queue: MediaObject[]) => {
    let multi = redis.multi().del(`${Sets.Lobbies}:${lobby_id}:${Lists.Queue}`);
    if (queue.length > 0) {
        multi.rpush(`${Sets.Lobbies}:${lobby_id}:${Lists.Queue}`, ...queue.map(serializeMediaObject));
    }
    return multi.exec_atomic();
};
