import { chatSaga } from "@features/chat/chatSaga";
import { ChatState } from "@features/chat/ChatState";
import { connectionSaga } from "@features/connection/connectionSaga";
import { MemberListState } from "@features/memberList/MemberListState";
import { userSaga } from "@features/user/userSaga";
import { UserState } from "@features/user/UserState";
import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { routerMiddleware } from "connected-react-router";
import createSagaMiddleware from "redux-saga";

const rootReducer = combineReducers({
    chat: ChatState.reducer,
    user: UserState.reducer,
    memberList: MemberListState.reducer,
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

const sagas = [chatSaga, userSaga, connectionSaga];

sagas.forEach((saga) => {
    sagaMiddleware.run(saga);
});

export type RootState = ReturnType<typeof rootReducer>;
