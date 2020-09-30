import { Lobby } from "@models/lobby";
import { createHandyClient } from "handy-redis";
import { ClientOpts } from "redis";

let opts: ClientOpts = {};
if (process.env.REDIS_KEY) {
    if (!process.env.REDIS_HOST) {
        throw "Missing REDIS_HOST environment variable";
    }
    if (!process.env.REDIS_PORT) {
        throw "Missing REDIS_PORT environment variable";
    }
    opts = {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        auth_pass: process.env.REDIS_KEY,
        tls: { servername: process.env.REDIS_HOST },
    };
}

export const redis = createHandyClient(opts);

export enum Sets {
    Lobbies = "lobbies",
}
export enum Lists {
    Chatlog = "chatlog",
    Queue = "queue",
}

export const LobbySchema = ["id", "playback_position", "title", "persist"] as const;

export type LobbyArray = SchemaAsRedisArray<Lobby, typeof LobbySchema>;

export type SchemaAsRedisArray<T, TSchema extends readonly (keyof T)[]> = {
    [K in keyof TSchema]: TSchema[K] extends keyof T ? T[TSchema[K]] : never;
};

export const mapRedisValue = <T extends string | number | null>(
    value: T
): true | false | undefined | Exclude<T, null> => {
    if (value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }
    if (value === null) {
        return undefined;
    }
    return value as Exclude<T, null>;
};
