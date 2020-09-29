import { Chat } from "@features/chat/Chat";
import { Faucet } from "@features/faucet/Faucet";
import { Header } from "@features/header/Header";
import { LobbyInfo } from "@features/lobbyInfo/LobbyInfo";
import { store } from "@redux";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./main.css";

const Main = () => {
    return (
        <Provider store={store}>
            <Header />
            <LobbyInfo />
            <Faucet />
            <Chat />
        </Provider>
    );
};

ReactDOM.render(<Main />, document.getElementById("app"));
