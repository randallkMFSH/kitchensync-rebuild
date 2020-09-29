import { RootState } from "@redux";

export const selectLobbyTitleLCE = (state: RootState) => {
    return state.lobbyInfo.title;
};
export const selectLobbyPersist = (state: RootState) => {
    return state.lobbyInfo.persist;
};
