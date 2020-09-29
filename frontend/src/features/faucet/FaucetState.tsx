import { LobbyInfoState } from "@features/lobbyInfo/LobbyInfoState";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const FaucetState = createSlice({
    name: "faucet",
    initialState: {
        targetPlaybackPosition: 0,
        lastPositionUpdateTimestamp: Date.now(),
        paused: true,
        needsInteractionForPlayback: false,
    },
    reducers: {
        play(state, action: PayloadAction<number | undefined>) {
            state.paused = false;
            if (action.payload !== undefined) {
                state.targetPlaybackPosition = action.payload;
                state.lastPositionUpdateTimestamp = Date.now();
            }
        },
        pause(state, action: PayloadAction<number | undefined>) {
            state.paused = true;
            if (action.payload !== undefined) {
                state.targetPlaybackPosition = action.payload;
                state.lastPositionUpdateTimestamp = Date.now();
            }
        },
        seek(state, action: PayloadAction<number>) {
            state.targetPlaybackPosition = action.payload;
            state.lastPositionUpdateTimestamp = Date.now();
        },
        setNeedsInteraction(state, action: PayloadAction<boolean>) {
            state.needsInteractionForPlayback = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(LobbyInfoState.actions.updateFromServer, (state, action) => {
            state.targetPlaybackPosition = action.payload.playback_position;
            state.lastPositionUpdateTimestamp = Date.now();
            state.paused = action.payload.paused;
        });
    },
});
