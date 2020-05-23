import { Chat } from "@features/chat/Chat";
import { store } from "@redux";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

const Main = () => {
    return (
        <Provider store={store}>
            <Chat />
        </Provider>
    );
};

ReactDOM.render(<Main />, document.getElementById("app"));
