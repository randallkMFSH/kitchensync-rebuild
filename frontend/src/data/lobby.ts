import { LobbyData } from "@common/apiModels";
import { LobbyMessage } from "@common/messages";

const id = location.pathname.split("/")[2];

const host = location.host;

const socket = new WebSocket(`ws://${host}/api/lobby/${id}`);

export const sendLobbyMessage = (message: LobbyMessage) => {
    socket.send(JSON.stringify(message));
};

export const onConnected = (connected: (websocket: WebSocket) => void) => {
    socket.addEventListener("open", () => {
        connected(socket);
    });
};

export const getLobbyData = async () => {
    const response = await fetch(`${location.protocol}//${host}/api/lobby/${id}`);
    const data: LobbyData = await response.json();
    return {
        ...data,
        chatLog: data.chatLog.map((chatEntry) => ({ ...chatEntry, timestamp: new Date(chatEntry.timestamp) })),
    };
};
