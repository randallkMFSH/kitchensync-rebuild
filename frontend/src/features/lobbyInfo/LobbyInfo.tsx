import { MemberList } from "@features/memberList/MemberList";
import { selectIsCurrentUserHost } from "@features/memberList/memberListSelectors";
import { Queue } from "@features/queue/Queue";
import { getDataOrPrevious } from "@util/LCE";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./lobbyInfo.css";
import { selectLobbyPersist, selectLobbyTitleLCE } from "./lobbyInfoSelectors";
import { LobbyInfoState } from "./LobbyInfoState";

export const LobbyTitle = () => {
    const isHost = useSelector(selectIsCurrentUserHost);
    const titleLCE = useSelector(selectLobbyTitleLCE);
    const title = getDataOrPrevious(titleLCE);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (title) {
            document.title = `KitchenSync - ${title}`;
        }
    }, [title]);

    if (!title) {
        return null;
    }

    if (!isHost || !isEditing) {
        return (
            <h1 className="title" onClick={setIsEditing.bind(undefined, true)}>
                {title}
            </h1>
        );
    }

    const changeTitle = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (inputRef.current?.value) {
            dispatch(LobbyInfoState.actions.setTitle(inputRef.current?.value));
            setIsEditing(false);
        }
    };
    return (
        <form onSubmit={changeTitle} className="title">
            <input ref={inputRef} defaultValue={title} onBlur={setIsEditing.bind(undefined, false)}></input>
        </form>
    );
};
export const LobbyPersist = () => {
    const isHost = useSelector(selectIsCurrentUserHost);
    const isPersisting = useSelector(selectLobbyPersist);
    const dispatch = useDispatch();

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(LobbyInfoState.actions.setPersist(event.target.checked));
    };

    return (
        <div>
            <label htmlFor="persist">Keep this lobby around after everyone has left?: </label>
            <input
                type="checkbox"
                name="persist"
                checked={isPersisting}
                disabled={!isHost}
                onChange={isHost ? onChange : undefined}
            />
        </div>
    );
};

export const LobbyInfo = () => {
    return (
        <div className="lobbyInfo">
            <LobbyTitle />
            <LobbyPersist />
            <Queue />
            <MemberList />
        </div>
    );
};
