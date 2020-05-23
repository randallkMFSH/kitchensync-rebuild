import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LCE, lceContent, lceLoading } from "@util/LCE";

export const UserState = createSlice({
    name: "user",
    initialState: {
        myName: lceContent(localStorage.getItem("name") ?? "anon") as LCE<string>,
    },
    reducers: {
        changeName(state, action: PayloadAction<string>) {
            state.myName = lceLoading<string>(state.myName);
        },
        changeNameSuccess(state, action: PayloadAction<string>) {
            state.myName = lceContent(action.payload);
        },
    },
});
