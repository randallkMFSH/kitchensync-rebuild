import { FaucetType } from "@common/apiModels";
import { MessageType } from "@common/messages";
import { sendLobbyMessage } from "@data/lobby";
import { selectIsCurrentUserHost } from "@features/memberList/memberListSelectors";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import "./faucet.css";
import { HTML5Faucet } from "./faucets/html5/HTML5Faucet";
import { NoFaucet } from "./faucets/none/NoFaucet";
import { YoutubeFaucet } from "./faucets/youtube/YoutubeFaucet";
import { selectCurrentFaucetType, selectNeedsInteractionForPlayback, selectShouldShowLoading } from "./faucetSelectors";
import { FaucetState } from "./FaucetState";

const NoMediaFaucet = () => {
    const isHost = useSelector(selectIsCurrentUserHost);
    return (
        <section className="noMedia">
            <h1>There's nothing playing right now.</h1>
            <p>{isHost ? "Add a URL in the input box to start playing." : "Wait for the host to add something."}</p>
        </section>
    );
};

const getFaucetComponent = (faucet_type: FaucetType | undefined) => {
    switch (faucet_type) {
        case "Youtube":
            return YoutubeFaucet;
        case "HTML5Video":
        case "HTML5Audio":
            return HTML5Faucet;
        case undefined:
            return NoMediaFaucet;
        default:
            return NoFaucet;
    }
};

const FaucetControl = {
    isHost: false,
    play(seconds: number | undefined) {
        if (FaucetControl.isHost) {
            sendLobbyMessage({ type: MessageType.PLAY, seconds });
        }
    },
    pause(seconds: number | undefined) {
        if (FaucetControl.isHost) {
            sendLobbyMessage({ type: MessageType.PAUSE, seconds });
        }
    },
    seek(seconds: number) {
        if (FaucetControl.isHost) {
            sendLobbyMessage({ type: MessageType.SEEK, seconds });
        }
    },
    ended() {
        if (FaucetControl.isHost) {
            sendLobbyMessage({ type: MessageType.ENDED });
        }
    },
};
export const FaucetContext = React.createContext(FaucetControl);

const FaucetLoading = () => {
    return <span>Loading...</span>;
};

const InteractionPrompt = () => {
    const dispatch = useDispatch();
    return (
        <section
            className="interactionPrompt"
            onClick={() => {
                dispatch(FaucetState.actions.setNeedsInteraction(false));
            }}>
            <h1>Click here to load the current media.</h1>
            <p>
                You're seeing this message because we've detected that your browser is preventing media playback until
                you interact with the page. Clicking here will allow us to play the media.
            </p>
        </section>
    );
};

export const Faucet = () => {
    const currentType = useSelector(selectCurrentFaucetType);
    FaucetControl.isHost = useSelector(selectIsCurrentUserHost);

    const shouldShowLoading = useSelector(selectShouldShowLoading);
    const needsInteractionForPlayback = useSelector(selectNeedsInteractionForPlayback);
    const FaucetComponent = shouldShowLoading ? FaucetLoading : getFaucetComponent(currentType);

    return (
        <FaucetContext.Provider value={FaucetControl}>
            <section className="faucet">
                {needsInteractionForPlayback && <InteractionPrompt />}
                <FaucetComponent />
            </section>
        </FaucetContext.Provider>
    );
};
