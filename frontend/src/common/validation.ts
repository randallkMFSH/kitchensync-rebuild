import validator from "validator";
import { FIELD_SEPARATOR } from "./apiModels";
import { LobbyMessage, MessageType } from "./messages";

export function validateNickname(name: string | undefined): asserts name is string {
    if (!name) {
        throw new Error("Undefined name");
    }
    if (!validator.isByteLength(name, { max: 512 })) {
        throw new Error("Name too long");
    }
    if (name.includes(FIELD_SEPARATOR)) {
        throw new Error("Name includes invalid character");
    }
}

export function validateMessage(message: string | undefined): asserts message is string {
    if (!message) {
        throw new Error("Undefined message");
    }
    if (!validator.isByteLength(message, { max: 2048 })) {
        throw new Error("Message too long");
    }
    if (message.includes(FIELD_SEPARATOR)) {
        throw new Error("Message includes invalid character");
    }
}

export function validateTitle(title: string | undefined): asserts title is string {
    if (!title) {
        throw new Error("Undefined title");
    }
    if (!validator.isByteLength(title, { max: 1024 })) {
        throw new Error("Title too long");
    }
    if (title.includes(FIELD_SEPARATOR)) {
        throw new Error("Title includes invalid character");
    }
}

function isObjectWithType(message: unknown): message is { type: string } {
    if (typeof message === "object" && message && "type" in message) {
        return true;
    }
    return false;
}

export function isLobbyMessage(message: unknown): message is LobbyMessage {
    return isObjectWithType(message) && message.type in MessageType;
}
