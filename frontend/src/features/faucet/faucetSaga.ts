import emptyWavFile from "@assets/empty.wav";
import { LobbyInfoState } from "@features/lobbyInfo/LobbyInfoState";
import { call, put, select, takeEvery } from "typed-redux-saga";
import { selectNeedsInteractionForPlayback, selectShouldBePaused } from "./faucetSelectors";
import { FaucetState } from "./FaucetState";

async function requiresInteractionToPlayAudio() {
    const testAudioPlayer = new Audio(emptyWavFile);
    try {
        await testAudioPlayer.play();
        return false;
    } catch {
        return true;
    }
}

const checkNeedsInteraction = function* () {
    const currentStatus = yield* select(selectNeedsInteractionForPlayback);
    const canPlayAudio = yield* call(requiresInteractionToPlayAudio);
    if (currentStatus !== canPlayAudio) {
        yield* put(FaucetState.actions.setNeedsInteraction(canPlayAudio));
    }
};

const checkInteractionIfPlaying = function* () {
    const isPaused = yield* select(selectShouldBePaused);
    if (!isPaused) {
        yield* call(checkNeedsInteraction);
    }
};

export const faucetSaga = function* () {
    yield* takeEvery(LobbyInfoState.actions.updateFromServer, checkInteractionIfPlaying);
    yield* takeEvery(FaucetState.actions.play, checkNeedsInteraction);
};
