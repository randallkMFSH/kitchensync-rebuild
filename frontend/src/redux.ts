import { chatSaga } from "@features/chat/chatSaga";
import { ChatState } from "@features/chat/ChatState";
import { connectionSaga } from "@features/connection/connectionSaga";
import { faucetSaga } from "@features/faucet/faucetSaga";
import { FaucetState } from "@features/faucet/FaucetState";
import { lobbyInfoSaga } from "@features/lobbyInfo/lobbyInfoSaga";
import { LobbyInfoState } from "@features/lobbyInfo/LobbyInfoState";
import { MemberListState } from "@features/memberList/MemberListState";
import { queueSaga } from "@features/queue/queueSaga";
import { QueueState } from "@features/queue/QueueState";
import { userSaga } from "@features/user/userSaga";
import { UserState } from "@features/user/UserState";
import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { routerMiddleware } from "connected-react-router";
import createSagaMiddleware from "redux-saga";

const rootReducer = combineReducers({
    chat: ChatState.reducer,
    user: UserState.reducer,
    memberList: MemberListState.reducer,
    lobbyInfo: LobbyInfoState.reducer,
    faucet: FaucetState.reducer,
    queue: QueueState.reducer,
});

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: rootReducer,
    middleware: [
        ...getDefaultMiddleware({ thunk: false, serializableCheck: false }),
        routerMiddleware(history),
        sagaMiddleware,
    ],
});

const sagas = [chatSaga, userSaga, connectionSaga, lobbyInfoSaga, queueSaga, faucetSaga];

sagas.forEach((saga) => {
    sagaMiddleware.run(saga);
});

export type RootState = ReturnType<typeof rootReducer>;
