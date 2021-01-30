import { Chat } from "@features/chat/Chat";
import { Faucet } from "@features/faucet/Faucet";
import { Header } from "@features/header/Header";
import { LobbyInfo } from "@features/lobbyInfo/LobbyInfo";
import { selectQueue } from "@features/queue/queueSelectors";
import { store } from "@redux";
import { getDataOrPrevious } from "@util/LCE";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Provider, useSelector } from "react-redux";
import "./main.css";

const SetBackgroundToCurrentQueueThumbnail = () => {
    const queueLCE = useSelector(selectQueue);
    const queue = getDataOrPrevious(queueLCE);
    const image = queue?.[0].image_url;
    useEffect(() => {
        if (image) {
            document.body.style.backgroundImage = `url(${image})`;
        } else {
            document.body.style.backgroundImage = "";
        }
    }, [image]);
    return null;
};

const Main = () => {
    return (
        <Provider store={store}>
            <SetBackgroundToCurrentQueueThumbnail />
            <Header />
            <LobbyInfo />
            <Faucet />
            <Chat />
        </Provider>
    );
};

ReactDOM.render(<Main />, document.getElementById("app"));
