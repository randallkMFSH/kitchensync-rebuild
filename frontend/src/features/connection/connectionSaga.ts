import { LobbyMessage, MessageType } from "@common/messages";
import { getLobbyData, onConnected, sendLobbyMessage } from "@data/lobby";
import { ChatState } from "@features/chat/ChatState";
import { selectUserNameLCE } from "@features/user/userSelector";
import { UserState } from "@features/user/UserState";
import { getDataOrPrevious } from "@util/LCE";
import { eventChannel } from "redux-saga";
import { call, put, select, takeEvery } from "typed-redux-saga";

const LobbyConnected = Symbol();

const makeLobbyChannel = () => {
    return eventChannel<LobbyMessage | typeof LobbyConnected>((emitter) => {
        onConnected((socket) => {
            socket.addEventListener("message", (messageEvent) => {
                const messageString = messageEvent.data.toString();
                console.log(messageString);
                const message: LobbyMessage = JSON.parse(messageString);
                emitter(message);
            });

            emitter(LobbyConnected);
        });
        return () => {};
    });
};

const handleMessage = function* (message: LobbyMessage | typeof LobbyConnected) {
    if (message === LobbyConnected) {
        const initialName = yield* select(selectUserNameLCE);
        sendLobbyMessage({ type: MessageType.IDENTITY, name: getDataOrPrevious(initialName)! });
        return;
    }

    switch (message.type) {
        case MessageType.IDENTITY:
            yield* put(UserState.actions.changeNameSuccess(message.name));
            break;
        case MessageType.BAD_MESSAGE:
        case MessageType.BAD_NICKNAME:
            yield* put(ChatState.actions.addLogMessage({ message: message.message, timestamp: new Date() }));
            break;
        case MessageType.CHAT:
            yield* put(
                ChatState.actions.addLogMessage({
                    sender: message.chatMessage.sender,
                    message: message.chatMessage.message!,
                    timestamp: new Date(message.chatMessage.timestamp!),
                })
            );
            break;
    }
};

export const connectionSaga = function* () {
    const lobbydata = yield* call(getLobbyData);
    yield* put(ChatState.actions.setLogFromService(lobbydata.chatLog));
    const lobbyChannel = yield* call(makeLobbyChannel);
    yield* takeEvery(lobbyChannel, handleMessage);
};
