import { LobbyData, LobbyDataOverWire } from "@common/apiModels";
import { LobbyMessage } from "@common/messages";

const id = location.pathname.split("/")[1];

const host = location.host;

const websocketProtocol = location.protocol === "http:" ? "ws" : "wss";

const socket = new WebSocket(`${websocketProtocol}://${host}/api/lobby/${id}`);

export const sendLobbyMessage = (message: LobbyMessage) => {
    const stringified = JSON.stringify(message);
    console.log("->", stringified);
    socket.send(stringified);
};

export const onConnected = (connected: (websocket: WebSocket) => void) => {
    socket.addEventListener("open", () => {
        connected(socket);
    });
};

export const onError = (error: (event: Event) => void) => {
    socket.addEventListener("error", error);
};

export const getLobbyData = async (): Promise<LobbyData> => {
    const response = await fetch(`${location.protocol}//${host}/api/lobby/${id}`);
    const data: LobbyDataOverWire = await response.json();
    return {
        ...data,
        chatLog: data.chatLog.map((chatEntry) => ({ ...chatEntry, timestamp: new Date(chatEntry.timestamp) })),
    };
};
