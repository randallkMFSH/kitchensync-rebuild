import { MessageType } from "@common/messages";
import { validateNickname } from "@common/validation";
import { sendLobbyMessage } from "@data/lobby";
import { ChatState } from "@features/chat/ChatState";
import { put, takeEvery } from "typed-redux-saga";
import { UserState } from "./UserState";

export const changeName = function* (action: ReturnType<typeof UserState["actions"]["changeName"]>) {
    try {
        validateNickname(action.payload);
        sendLobbyMessage({
            type: MessageType.IDENTITY,
            name: action.payload,
        });
        localStorage.setItem("name", action.payload);
        yield* put(UserState.actions.changeNameSuccess(action.payload));
    } catch (e) {
        if (e instanceof Error) {
            yield* put(ChatState.actions.addLogMessage({ message: e.message, timestamp: new Date() }));
        }
    }
};

export const userSaga = function* () {
    yield* takeEvery(UserState.actions.changeName, changeName);
};
