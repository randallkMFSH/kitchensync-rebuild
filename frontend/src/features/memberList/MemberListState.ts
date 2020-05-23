import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const MemberListState = createSlice({
    name: "memberList",
    initialState: {
        list: [] as string[],
        host: undefined as string | undefined,
    },
    reducers: {
        updateList(state, action: PayloadAction<string[]>) {
            state.list = action.payload;
        },
        promotion(state, action: PayloadAction<string>) {
            state.host = action.payload;
        },
    },
});
