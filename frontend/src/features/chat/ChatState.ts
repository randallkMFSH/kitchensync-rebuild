import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LCE, lceContent, lceLoading, lceNotRequested } from "@util/LCE";
import { ChatLogMessage } from "./chatModels";

export const ChatState = createSlice({
    name: "chat",
    initialState: {
        log: [] as ChatLogMessage[],
        sendingMessage: lceNotRequested() as LCE<ChatLogMessage>,
    },
    reducers: {
        addLogMessage(state, action: PayloadAction<ChatLogMessage>) {
            state.log.push(action.payload);
        },
        sendMessage(state, action: PayloadAction<string>) {
            state.sendingMessage = lceLoading<ChatLogMessage>(
                lceContent({
                    message: action.payload,
                    timestamp: new Date(),
                })
            );
        },
        sendMessageSuccess(state) {
            state.sendingMessage = lceNotRequested();
        },
        setLogFromService(state, action: PayloadAction<ChatLogMessage[]>) {
            state.log = action.payload;
        },
    },
});
