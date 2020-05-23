import { MessageType } from "@common/messages";
import { validateMessage } from "@common/validation";
import { sendLobbyMessage } from "@data/lobby";
import { selectUserNameLCE } from "@features/user/userSelector";
import { getDataOrPrevious } from "@util/LCE";
import { put, select, takeEvery } from "typed-redux-saga";
import { ChatState } from "./ChatState";

export const sendMessageSaga = function* (action: ReturnType<typeof ChatState["actions"]["sendMessage"]>) {
    try {
        validateMessage(action.payload);
        sendLobbyMessage({
            type: MessageType.CHAT,
            chatMessage: {
                message: action.payload,
            },
        });
        yield* put(ChatState.actions.sendMessageSuccess());

        const myName = getDataOrPrevious(yield* select(selectUserNameLCE));
        yield* put(
            ChatState.actions.addLogMessage({
                sender: myName,
                message: action.payload,
                timestamp: new Date(),
            })
        );
    } catch (e) {
        if (e instanceof Error) {
            yield* put(ChatState.actions.addLogMessage({ message: e.message, timestamp: new Date() }));
        }
    }
};

export const chatSaga = function* () {
    yield* takeEvery(ChatState.actions.sendMessage.type, sendMessageSaga);
};
