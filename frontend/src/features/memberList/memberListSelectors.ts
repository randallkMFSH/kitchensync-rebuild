import { RootState } from "@redux";
import { getDataOrPrevious, isContent } from "@util/LCE";

export const selectIsCurrentUserHost = (state: RootState) => {
    if (!isContent(state.user.myName)) {
        // If we haven't loaded our name yet, we can't rely on it
        // so assume not host
        return false;
    }
    const host = state.memberList.host;
    const myName = getDataOrPrevious(state.user.myName);
    return host === myName;
};
