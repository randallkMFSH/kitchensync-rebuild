import { FaucetType } from "@common/apiModels";
import { selectCurrentMediaObject } from "@features/queue/queueSelectors";
import { RootState } from "@redux";
import { getDataOrPrevious, isLoading } from "@util/LCE";

export const selectCurrentFaucetType = (state: RootState): FaucetType | undefined =>
    selectCurrentMediaObject(state)?.faucet_type;
export const selectShouldBePaused = (state: RootState) => state.faucet.paused;
export const selectLastSeekTarget = (state: RootState) => state.faucet.targetPlaybackPosition;
export const selectLastPositionUpdateTimestamp = (state: RootState) => state.faucet.lastPositionUpdateTimestamp;
export const selectShouldShowLoading = (state: RootState): boolean => {
    if (isLoading(state.queue.queue)) {
        const previous = getDataOrPrevious(state.queue.queue);
        if (previous && previous.length > 0) {
            return false;
        }
        return true;
    }
    return false;
};
export const selectNeedsInteractionForPlayback = (state: RootState): boolean => {
    return state.faucet.needsInteractionForPlayback;
};
