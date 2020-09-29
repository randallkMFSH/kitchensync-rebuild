import { MediaObject } from "@common/apiModels";
import { LobbyInfoState } from "@features/lobbyInfo/LobbyInfoState";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDataOrPrevious, LCE, lceContent, lceLoading } from "@util/LCE";

export const QueueState = createSlice({
    name: "queue",
    initialState: {
        queue: lceLoading() as LCE<MediaObject[]>,
        error: undefined as string | undefined,
    },
    reducers: {
        addToQueue(state, action: PayloadAction<string>) {
            state.queue = lceLoading(getDataOrPrevious(state.queue));
        },
        deleteMedia(state, action: PayloadAction<string>) {
            state.queue = lceLoading(getDataOrPrevious(state.queue));
        },
        skipToMedia(state, action: PayloadAction<string>) {
            state.queue = lceLoading(getDataOrPrevious(state.queue));
        },
        changeMedia(state, action: PayloadAction<string>) {
            state.queue = lceLoading(getDataOrPrevious(state.queue));
        },
        setQueue(state, action: PayloadAction<MediaObject[]>) {
            state.queue = lceContent(action.payload);
        },
        setError(state, action: PayloadAction<string | undefined>) {
            state.error = action.payload;
            state.queue = lceContent(getDataOrPrevious(state.queue) || []);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(LobbyInfoState.actions.updateFromServer, (state, action) => {
            state.queue = lceContent(action.payload.queue);
        });
    },
});
