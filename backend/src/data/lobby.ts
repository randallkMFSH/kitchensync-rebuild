import { Lobby } from "@models/lobby";
import crypto from "crypto";
import { knex } from "./database";
import { lobbyIdAdjectives, lobbyIdNouns } from "./kitchen_words";

export const lobbyTable = () => knex<Lobby>("lobbies");

export const getLobbyFromDatabaseById = (id: string) => {
    return lobbyTable().where("id", id).first();
};

export const createLobby = async (): Promise<Lobby> => {
    let id: string;
    let existingLobby: Lobby | undefined;
    // generate ids until we get one that's not being used
    do {
        id = await generateId();
        existingLobby = await getLobbyFromDatabaseById(id);
    } while (existingLobby);

    await lobbyTable().insert({ id, playback_position: 0 });
    return { id, playback_position: 0 };
};

export const saveLobby = async (lobby: Lobby) => {
    return lobbyTable().insert(lobby);
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
