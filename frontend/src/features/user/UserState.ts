import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDataOrPrevious, LCE, lceContent, lceLoading } from "@util/LCE";

export const UserState = createSlice({
    name: "user",
    initialState: {
        myName: lceContent(localStorage.getItem("name") ?? "anon") as LCE<string>,
        hasBeenWelcomed: false,
    },
    reducers: {
        changeName(state, action: PayloadAction<string>) {
            state.myName = lceLoading<string>(getDataOrPrevious(state.myName));
        },
        changeNameSuccess(state, action: PayloadAction<string>) {
            state.myName = lceContent(action.payload);
        },
        welcome(state) {
            state.hasBeenWelcomed = true;
        },
    },
});
