import { getDataOrPrevious } from "@util/LCE";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUserNameLCE } from "./userSelector";
import { UserState } from "./UserState";

export const UsernameInput = () => {
    const currentName = useSelector(selectUserNameLCE);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();

    const changeName = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (inputRef.current?.value) {
            dispatch(UserState.actions.changeName(inputRef.current?.value));
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (isEditing) {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [isEditing]);

    if (isEditing) {
        const existingName = getDataOrPrevious(currentName);
        return (
            <form onSubmit={changeName} className="myUsername">
                <input ref={inputRef} defaultValue={existingName} onBlur={setIsEditing.bind(undefined, false)}></input>
            </form>
        );
    } else {
        const name = getDataOrPrevious(currentName);
        return (
            <span className="myUsername" onClick={setIsEditing.bind(undefined, true)}>
                {name}
            </span>
        );
    }
};
