import { RootState } from "@redux";

export const selectHost = (state: RootState) => {
    return state.memberList.host;
};
export const selectMemberList = (state: RootState) => {
    return state.memberList.list;
};
