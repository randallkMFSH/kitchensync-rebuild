import { LobbyData } from "@common/apiModels";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDataOrPrevious, LCE, lceContent, lceLoading, lceNotRequested } from "@util/LCE";

export const LobbyInfoState = createSlice({
    name: "lobbyInfo",
    initialState: {
        title: lceNotRequested() as LCE<string>,
        persist: false as boolean | undefined,
    },
    reducers: {
        updateFromServer(state, action: PayloadAction<LobbyData>) {
            if (action.payload.title) {
                state.title = lceContent<string>(action.payload.title);
            } else {
                state.title = lceNotRequested();
            }
            state.persist = action.payload.persist;
        },
        setTitle(state, action: PayloadAction<string>) {
            state.title = lceLoading<string>(getDataOrPrevious(state.title));
        },
        setTitleSuccess(state, action: PayloadAction<string>) {
            state.title = lceContent(action.payload);
        },
        updateTitleFromServer(state, action: PayloadAction<string>) {
            state.title = lceContent(action.payload);
        },
        setPersist(state, action: PayloadAction<boolean>) {
            state.persist = action.payload;
        },
        updatePersistFromServer(state, action: PayloadAction<boolean>) {
            state.persist = action.payload;
        },
    },
});
