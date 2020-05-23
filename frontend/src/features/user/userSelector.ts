import { RootState } from "@redux";

export const selectUserNameLCE = (state: RootState) => {
    return state.user.myName;
};
