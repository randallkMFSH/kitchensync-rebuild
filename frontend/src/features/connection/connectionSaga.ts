import { LobbyMessage, MessageType } from "@common/messages";
import { onConnected, onError, sendLobbyMessage } from "@data/lobby";
import { ChatState } from "@features/chat/ChatState";
import { FaucetState } from "@features/faucet/FaucetState";
import { LobbyInfoState } from "@features/lobbyInfo/LobbyInfoState";
import { MemberListState } from "@features/memberList/MemberListState";
import { QueueState } from "@features/queue/QueueState";
import { selectUserNameLCE } from "@features/user/userSelector";
import { UserState } from "@features/user/UserState";
import { getDataOrPrevious } from "@util/LCE";
import { eventChannel } from "redux-saga";
import { call, put, select, takeEvery } from "typed-redux-saga";

const LobbyConnected = Symbol();
const LobbyError = Symbol();

const makeLobbyChannel = () => {
    return eventChannel<LobbyMessage | typeof LobbyConnected | typeof LobbyError>((emitter) => {
        onConnected((socket) => {
            socket.addEventListener("message", (messageEvent) => {
                const messageString = messageEvent.data.toString();
                console.log(messageString);
                const message: LobbyMessage = JSON.parse(messageString);
                emitter(message);
            });

            emitter(LobbyConnected);
        });
        onError((event) => {
            emitter(LobbyError);
        });
        return () => {};
    });
};

const handleMessage = function* (message: LobbyMessage | typeof LobbyConnected | typeof LobbyError) {
    if (message === LobbyConnected) {
        const initialName = yield* select(selectUserNameLCE);
        sendLobbyMessage({ type: MessageType.IDENTITY, name: getDataOrPrevious(initialName)! });
        return;
    }
    if (message === LobbyError) {
        yield* put(
            ChatState.actions.addLogMessage({
                message: "There was an error connecting to the lobby.",
                timestamp: new Date(),
            })
        );
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
        case MessageType.WELCOME:
            yield* put(UserState.actions.welcome());
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
        case MessageType.UPDATE_USER_LIST:
            yield* put(MemberListState.actions.updateList(message.userList));
            break;
        case MessageType.UPDATE_PERSIST:
            yield* put(LobbyInfoState.actions.updatePersistFromServer(message.persist));
            break;
        case MessageType.UPDATE_TITLE:
            yield* put(LobbyInfoState.actions.updateTitleFromServer(message.title));
            break;
        case MessageType.PROMOTION:
            yield* put(MemberListState.actions.promotion(message.newHost));
            break;
        case MessageType.PLAY:
            yield* put(FaucetState.actions.play(message.seconds));
            break;
        case MessageType.PAUSE:
            yield* put(FaucetState.actions.pause(message.seconds));
            break;
        case MessageType.SEEK:
            yield* put(FaucetState.actions.seek(message.seconds));
            break;
        case MessageType.SET_QUEUE:
            yield* put(QueueState.actions.setQueue(message.queue));
            break;
        case MessageType.MEDIA_FAILURE:
            yield* put(QueueState.actions.setError(message.message || "Something went wrong."));
            break;
    }
};

export const connectionSaga = function* () {
    const lobbyChannel = yield* call(makeLobbyChannel);
    yield* takeEvery(lobbyChannel, handleMessage);
};
