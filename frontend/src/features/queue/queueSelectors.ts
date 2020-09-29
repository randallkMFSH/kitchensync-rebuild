import { MediaObject } from "@common/apiModels";
import { RootState } from "@redux";
import { getDataOrPrevious, LCE } from "@util/LCE";

export const selectCurrentMediaObject = (state: RootState): MediaObject | undefined => {
    const queue = getDataOrPrevious(state.queue.queue);
    if (!queue) {
        return undefined;
    }
    return queue[0];
};

export const selectQueue = (state: RootState): LCE<MediaObject[]> => {
    return state.queue.queue;
};

export const selectQueueErrorMessage = (state: RootState): string | undefined => {
    return state.queue.error;
};
