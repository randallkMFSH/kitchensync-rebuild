import { MessageType } from "@common/messages";
import { validateTitle } from "@common/validation";
import { getLobbyData, sendLobbyMessage } from "@data/lobby";
import { ChatState } from "@features/chat/ChatState";
import { MemberListState } from "@features/memberList/MemberListState";
import { call, put, takeEvery } from "typed-redux-saga";
import { LobbyInfoState } from "./LobbyInfoState";

const setLobbyTitleSaga = function* (action: ReturnType<typeof LobbyInfoState["actions"]["setTitle"]>) {
    try {
        validateTitle(action.payload);
        sendLobbyMessage({
            type: MessageType.UPDATE_TITLE,
            title: action.payload,
        });
        yield* put(LobbyInfoState.actions.setTitleSuccess(action.payload));
    } catch (e) {
        if (e instanceof Error) {
            yield* put(ChatState.actions.addLogMessage({ message: e.message, timestamp: new Date() }));
        }
    }
};

const setLobbyPersistSaga = function* (action: ReturnType<typeof LobbyInfoState["actions"]["setPersist"]>) {
    sendLobbyMessage({
        type: MessageType.UPDATE_PERSIST,
        persist: action.payload,
    });
};

const promoteOtherUserSaga = function* (action: ReturnType<typeof MemberListState["actions"]["promoteOtherUser"]>) {
    sendLobbyMessage({
        type: MessageType.PROMOTION,
        newHost: action.payload,
    });
};

export const lobbyInfoSaga = function* () {
    yield* takeEvery(LobbyInfoState.actions.setTitle, setLobbyTitleSaga);
    yield* takeEvery(LobbyInfoState.actions.setPersist, setLobbyPersistSaga);
    yield* takeEvery(MemberListState.actions.promoteOtherUser, promoteOtherUserSaga);

    const lobbydata = yield* call(getLobbyData);
    yield* put(ChatState.actions.setLogFromService(lobbydata.chatLog));
    yield* put(MemberListState.actions.updateList(lobbydata.members));
    if (lobbydata.host) {
        yield* put(MemberListState.actions.promotion(lobbydata.host));
    }
    yield* put(LobbyInfoState.actions.updateFromServer(lobbydata));
};
