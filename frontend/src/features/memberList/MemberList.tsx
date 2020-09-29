import React from "react";
import { useDispatch, useSelector } from "react-redux";
import "./memberList.css";
import { selectHost, selectMemberList } from "./memberListSelector";
import { selectIsCurrentUserHost } from "./memberListSelectors";
import { MemberListState } from "./MemberListState";

export const MemberList = () => {
    const list = useSelector(selectMemberList);
    const host = useSelector(selectHost);
    const isCurrentUserHost = useSelector(selectIsCurrentUserHost);
    const dispatch = useDispatch();

    const promote = (user: string) => {
        dispatch(MemberListState.actions.promoteOtherUser(user));
    };

    return (
        <ul className="memberList">
            {list.map((user) => (
                <li
                    key={user}
                    className={user === host ? "host" : undefined}
                    title={user}
                    onClick={isCurrentUserHost ? promote.bind(undefined, user) : undefined}>
                    {user}
                </li>
            ))}
        </ul>
    );
};
