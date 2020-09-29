import { MessageType } from "@common/messages";
import { sendLobbyMessage } from "@data/lobby";
import { takeEvery } from "typed-redux-saga";
import { QueueState } from "./QueueState";

export const addToQueueSaga = function* (action: ReturnType<typeof QueueState["actions"]["addToQueue"]>) {
    const url = action.payload;
    sendLobbyMessage({ type: MessageType.ADD_TO_QUEUE, url });
};

export const changeMediaSaga = function* (action: ReturnType<typeof QueueState["actions"]["changeMedia"]>) {
    const url = action.payload;
    sendLobbyMessage({ type: MessageType.CHANGE_MEDIA, url });
};

export const deleteMediaSaga = function* (action: ReturnType<typeof QueueState["actions"]["deleteMedia"]>) {
    const guid = action.payload;
    sendLobbyMessage({ type: MessageType.REMOVE_ITEM_FROM_QUEUE, guid });
};
export const skipToMediaSaga = function* (action: ReturnType<typeof QueueState["actions"]["skipToMedia"]>) {
    const guid = action.payload;
    sendLobbyMessage({ type: MessageType.SKIP_TO_ITEM, guid });
};

export const queueSaga = function* () {
    yield* takeEvery(QueueState.actions.addToQueue, addToQueueSaga);
    yield* takeEvery(QueueState.actions.changeMedia, changeMediaSaga);
    yield* takeEvery(QueueState.actions.deleteMedia, deleteMediaSaga);
    yield* takeEvery(QueueState.actions.skipToMedia, skipToMediaSaga);
};
