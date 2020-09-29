import { RootFaucet } from "@lib/faucet";
import { Lobby } from "@models/lobby";
import crypto from "crypto";
import { lobbyIdAdjectives, lobbyIdNouns } from "./kitchen_words";
import { addMediaObjectToQueue } from "./mediaObjects";
import { Lists, LobbyArray, LobbySchema, mapRedisValue, redis, Sets } from "./redis";

export const doesLobbyExist = async (id: string): Promise<boolean> => {
    return (await redis.sismember(Sets.Lobbies, id)) === 1;
};

function assertLobbyValues(values: readonly unknown[]): asserts values is LobbyArray {
    if (values.length !== LobbySchema.length) {
        throw "invalid lobby values count";
    }
}

export const getLobbyFromDatabaseById = async (id: string): Promise<Lobby | undefined> => {
    const keys = LobbySchema.map((key) => `${Sets.Lobbies}:${id}:${key}`);
    const rawValues = await redis.mget(...keys);
    const lobbyValues = rawValues.map(mapRedisValue);
    // if id is undefined, assume it's all invalid
    if (lobbyValues[0] === undefined) {
        return undefined;
    }
    assertLobbyValues(lobbyValues);
    return {
        id: lobbyValues[0],
        playback_position: typeof lobbyValues[1] === "string" ? parseFloat(lobbyValues[1]) : lobbyValues[1],
        title: lobbyValues[2],
        persist: lobbyValues[3],
    };
};

export const createLobby = async (): Promise<Lobby> => {
    let id: string;
    let lobbyAlreadyExists: boolean;
    // generate ids until we get one that's not being used
    do {
        id = await generateId();
        lobbyAlreadyExists = await doesLobbyExist(id);
    } while (lobbyAlreadyExists);

    await redis.mset([`${Sets.Lobbies}:${id}:id`, id], [`${Sets.Lobbies}:${id}:playback_position`, "0"]);

    const defaultMedia = await RootFaucet.attemptToCreateMediaObjectFromUrl(
        "https://www.youtube.com/watch?v=lTx3G6h2xyA"
    );
    if (defaultMedia) {
        await addMediaObjectToQueue(id, defaultMedia[0]);
    }

    return { id, playback_position: 0 };
};

export const saveLobby = async (lobby: Lobby) => {
    const params: (readonly [string, string])[] = [];

    const keysToDelete: string[] = [];

    LobbySchema.forEach((key) => {
        const value = lobby[key];
        if (value === undefined) {
            keysToDelete.push(key);
        } else {
            params.push([`${Sets.Lobbies}:${lobby.id}:${key}`, value.toString()] as const);
        }
    });

    if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
    }
    if (params.length > 0) {
        await redis.mset(...(params as [string, string][]));
    }
};

export const deleteLobby = async (id: string) => {
    const keys = [...LobbySchema, Lists.Queue, Lists.Chatlog].map((key) => `${Sets.Lobbies}:${id}:${key}`);
    await redis.del(...keys);
};

const randomInteger = () =>
    new Promise<number>((resolve, reject) =>
        crypto.randomBytes(2, (err, value) => {
            if (err) {
                return reject(err);
            }
            resolve(value.readUInt16LE());
        })
    );

const generateAdjective = async () => {
    const randInteger = await randomInteger();
    return lobbyIdAdjectives[randInteger % lobbyIdAdjectives.length];
};
const generateNoun = async () => {
    const randInteger = await randomInteger();
    return lobbyIdNouns[randInteger % lobbyIdNouns.length];
};

const generateId = async () => {
    const idComponents = await Promise.all([generateAdjective(), generateAdjective(), generateNoun()]);
    return idComponents.join("");
};
