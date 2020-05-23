import { RootState } from "@redux";

export const selectChatLog = (state: RootState) => {
    return state.chat.log;
};
