import { UsernameInput } from "@features/user/UsernameInput";
import React, { useRef } from "react";
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
    return (
        <section className="chatLog">
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
