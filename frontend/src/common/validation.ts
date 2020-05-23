import validator from "validator";
import { LobbyMessage, MessageType } from "./messages";

export const validateNickname = (name: string | undefined) => {
    if (!name) {
        throw new Error("Undefined name");
    }
    if (!validator.isAlphanumeric(name)) {
        throw new Error("Name must contain only letters and numbers");
    }
    if (!validator.isByteLength(name, { max: 512 })) {
        throw new Error("Name too long");
    }

    return true;
};

export const validateMessage = (message: string | undefined) => {
    if (!message) {
        throw new Error("Undefined message");
    }
    if (!validator.isByteLength(message, { max: 2048 })) {
        throw new Error("Message too long");
    }
};

const isObjectWithType = (message: unknown): message is { type: string } => {
    if (typeof message === "object" && message && "type" in message) {
        return true;
    }
    return false;
};

export const isLobbyMessage = (message: unknown): message is LobbyMessage => {
    return isObjectWithType(message) && message.type in MessageType;
};
