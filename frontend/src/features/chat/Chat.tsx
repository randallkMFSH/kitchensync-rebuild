import { UsernameInput } from "@features/user/UsernameInput";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./chat.css";
import { ChatLogMessage } from "./chatModels";
import { selectChatLog } from "./chatSelectors";
import { ChatState } from "./ChatState";

const ChatInput = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (inputRef.current?.value) {
            event.preventDefault();
            dispatch(ChatState.actions.sendMessage(inputRef.current.value));
            inputRef.current.value = "";
        }
    };
    return (
        <form onSubmit={onSubmit} className="chatInput">
            <input ref={inputRef}></input>
        </form>
    );
};

interface ChatMessageProps {
    readonly message: ChatLogMessage;
}
const ChatMessage = (props: ChatMessageProps) => {
    const { sender, message, timestamp } = props.message;
    return (
        <article className="message">
            {sender && <span className="sender">{sender}</span>}
            <span className="messageContents">{message}</span>
        </article>
    );
};

const ChatLog = () => {
    const log = useSelector(selectChatLog);
    const chatLogRef = useRef<HTMLElement>(null);
    const isCloseToBottomRef = useRef<boolean>(true);

    const onScroll = () => {
        const logContainer = chatLogRef.current;
        if (logContainer) {
            isCloseToBottomRef.current =
                logContainer.scrollHeight - logContainer.offsetHeight - 50 < logContainer.scrollTop;
        }
    };

    // If we're not scrolled up, scroll to bottom when new messages are logged
    useEffect(() => {
        const logContainer = chatLogRef.current;
        if (logContainer) {
            if (isCloseToBottomRef.current) {
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        }
    }, [log.length]);

    return (
        <section className="chatLog" ref={chatLogRef} onScroll={onScroll}>
            {log.map((message, index) => (
                <ChatMessage message={message} key={index} />
            ))}
        </section>
    );
};

export const Chat = () => {
    return (
        <section className="chat">
            <ChatLog />
            <UsernameInput />
            <ChatInput />
        </section>
    );
};
